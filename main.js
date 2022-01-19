"use strict";

const {
  BrowserWindow,
  ipcMain,
  nativeTheme,
  dialog,
  app,
  Menu,
  MenuItem,
  globalShortcut
} = require("electron");

const E = require("./events");

const path = require('path');

const DirectoryActions = require("./src/directoryActions");

const ModelProcess = require("./src/languages");

const menu = new Menu();

const unhandled = require("electron-unhandled");

const logger = require("electron-log");

const os = require('os');

console.log(" app data ", app.getPath("appData"));
logger.info(" file loaded ");
let LanProcess = null;
let executable_path = "";
const WINDOWS = "Windows_NT";
const LINUX = "Linux";
const MAC = "Darwin";

switch (os.type()) {
  case WINDOWS:
    executable_path = app.getPath("temp").replace(/(temp|Temp)/g, '');
    break;

  case LINUX:
    executable_path = "/opt/planck_app/";
    break;
}

try {
  menu.append(new MenuItem({
    label: 'File',
    submenu: [{
      role: 'fileMenu',
      click: saveCurrentFile
    }]
  }));

  function saveCurrentFile() {
    ipcSend(mainWindow, E.SAVE_FILE);
  } // Handle creating/removing shortcuts on Windows when installing/uninstalling.


  if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit();
  }

  let PROJECT_TYPE;
  let CURRENT_DIRECTORY;
  const _PROJECTS = {
    'html': {
      index: path.resolve(__dirname, "./html-renderer.js/index.html")
    },
    'javascript': {
      index: path.resolve(__dirname, "./js-renderer.js/index.html")
    }
  };
  let currentMode = "";
  let mainWindow = null;
  let ProcessWindow = null;
  let process_started = false;
  app.removeAllListeners('ready');

  const ipcSend = (currentWindow, channel, data) => {
    return new Promise(resolve => {
      if (currentWindow == undefined) {
        console.error(" main window not yet defined");
        resolve(false);
      } else {
        currentWindow.webContents.send(channel, data);
        resolve(true);
      }
    });
  };

  const AppSetUp = () => {
    return new Promise(resolve => {
      mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        webPreferences: {
          nodeIntegration: true,
          nodeIntegrationInSubFrames: true,
          nodeIntegrationInWorker: true,
          preload: path.join(__dirname, "./preload-bundled.js"),
          contextIsolation: false
        }
      }); //open main window devtools.

      mainWindow.webContents.openDevTools({
        mode: "detach"
      }); //load file.

      mainWindow.loadFile(path.resolve(__dirname, "./index.html"));
      logger.info(" application set up complete. ");
      mainWindow.on("close", () => {
        if (process_started) ProcessWindow.close();
      });
      resolve();
    });
  };

  const ProcessWindowSetup = ({
    indexpath,
    processData
  }) => {
    return new Promise(async resolve => {
      ProcessWindow = new BrowserWindow({
        width: 600,
        x: 600,
        y: 0,
        show: false,
        webPreferences: {
          nodeIntegration: true,
          nodeIntegrationInSubFrames: true,
          nodeIntegrationInWorker: true,
          contextIsolation: false
        }
      }); //load file into process window.

      await ProcessWindow.loadFile(indexpath);
      ProcessWindow.webContents.openDevTools({
        mode: "detach"
      });
      ProcessWindow.on("close", () => {
        ipcSend(mainWindow, E.PROCESS_STOPPED);
      });
      resolve(true);
      process_started = true;
      ipcSend(ProcessWindow, E.RUN_GUI, processData);
      ipcMain.on(E.UI_READY, (e, from) => {
        if (from == "process") ProcessWindow.show();
      });
    });
  };
  /** creatWindow function. */


  const createWindow = () => {
    // Create the browser window.
    AppSetUp().then(() => {
      //ipcSend functionality
      ipcSend(mainWindow, E.APP_STARTUP, {}).then(() => {
        logger.info(" main window application startup begun. "); //mainWindow.webContents.openDevTools({ mode:"detach" });

        ipcMain.once(E.UI_READY, (_, mode) => {
          ; //set current mode;

          currentMode = mode;
          logger.info(" ui ready. ");
          nativeTheme.themeSource = mode; // and load the index.html of the app.
          // Open the DevTools.
          //show user interface.

          mainWindow.show();
          ipcSend(mainWindow, E.DIR_PRESENT);
        });
      });
    });
  }; // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.


  app.once('ready', createWindow);
  app.whenReady().then(() => {
    globalShortcut.register("Ctrl+S", () => {
      return saveCurrentFile();
    });
  }); // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  }); // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and import them here.

  ipcMain.handle(E.UI_MODE_TOGGLE, e => {
    //current mode
    currentMode = currentMode == "dark" ? "light" : "dark"; //toggle native theme.

    nativeTheme.themeSource = currentMode; //use of dark colors.

    return nativeTheme.shouldUseDarkColors;
  });
  ipcMain.on(E.DIR_PRESENT, (e, present) => {
    CURRENT_DIRECTORY = present.currentDirectory;
    PROJECT_TYPE = present.PROJECT_TYPE;
    LanProcess = new ModelProcess({
      basepath: CURRENT_DIRECTORY,
      project_type: PROJECT_TYPE,
      babel_path: executable_path,
      packed: true
    });
    LanProcess.setBaseDir(CURRENT_DIRECTORY); //enable global shortcuts for new file creation and
    //new directory creation

    globalShortcut.register("Ctrl+n", () => newNode('file'));
    globalShortcut.register("Ctrl+d", () => newNode('directory'));
  });
  ipcMain.on(E.OPEN_FILES_PRESENT, async (e, openFiles) => {
    await Promise.all(Object.keys(openFiles).map(async file => {
      let {
        path
      } = openFiles[file];
      let sourceCode = '';

      try {
        sourceCode = await DirectoryActions.readFromFile(path);
      } catch (e) {}

      openFiles[file].sourceCode = sourceCode;
    })); //send data over the main window.

    ipcSend(mainWindow, E.OPEN_FILES_PRESENT, openFiles);
  });
  ipcMain.on(E.NEW_FILE, async (e, filepath) => {
    try {
      await DirectoryActions.writeToFile(filepath, '');
    } catch (e) {
      console.log(" error occured ", e);
      throw e;
    }
  });
  ipcMain.on(E.NEW_FOLDER, async (e, filepath) => {
    try {
      await DirectoryActions.createDir(filepath);
    } catch (e) {
      console.log(' error occured  in attempt to create new directory', e);
      throw e;
    }
  });

  async function newNode(type) {
    //user must choose directory in which new file will be based.
    let dialogOptions = {
      title: "select directory",
      properties: ['openDirectory'],
      filters: {
        name: "All Files",
        extensions: ['*']
      },
      message: "select directory",
      defaultPath: CURRENT_DIRECTORY
    };
    let data;

    try {
      data = await dialog.showOpenDialog(mainWindow, dialogOptions);
    } catch (e) {
      /* data not found. */
      throw e;
    }

    switch (type) {
      case 'file':
        ipcSend(mainWindow, E.NEW_FILE, data);
        break;

      case 'directory':
        ipcSend(mainWindow, E.NEW_FOLDER, data);
    }
  }

  ipcMain.handle(E.OPEN_DIR_PROMPT, (e, projectType) => {
    //set project type.
    PROJECT_TYPE = projectType;
    let dialogOptions = {
      title: "select folder",
      properties: ['openDirectory'],
      filters: {
        name: "All Files",
        extensions: ['*']
      },
      message: "select directory"
    };
    return dialog.showOpenDialog(mainWindow, dialogOptions).then(async data => {
      //once directory selected enable global shortcut for new file creation.
      console.log(" open directory data ", data);
      globalShortcut.register("Ctrl+n", () => newNode('file')); //along with a global shortcut for new directory creation.

      globalShortcut.register("Ctrl+d", () => newNode("directory"));
      if (data.canceled) return data;
      CURRENT_DIRECTORY = data.filePaths[0];
      LanProcess = new ModelProcess({
        basepath: CURRENT_DIRECTORY,
        project_type: PROJECT_TYPE,
        babel_path: executable_path,
        packed: true
      });
      console.log(" process ", LanProcess);

      switch (PROJECT_TYPE) {
        case 'javascript':
          console.log(" javascript process ");
          LanProcess.transformProject().then(() => {
            console.log(" project transformation. ");

            if (LanProcess.project_init_complete) {
              console.log(" project complete ", LanProcess.project_init_complete);
              let deps = LanProcess.getDependencies(); //send project dependencies to main window.

              ipcSend(mainWindow, E.PROJECT_DEP, deps);
            }
          });
          break;
      }

      return data;
    });
  });
  ipcMain.handle(E.OPEN_FILE, async (e, {
    filepath,
    newlyCreated
  }) => {
    //console.log(" filepath obtained ",filepath);
    let code;

    try {
      code = await DirectoryActions.readFromFile(filepath);
    } catch (e) {
      code = newlyCreated ? '' : `ERR:404\nFile not found :/`;
      throw e;
    }

    code = code.replace(';', '\n');
    return code;
  }); //in the instance where updated source code is to be saved.

  ipcMain.on(E.SAVE_FILE, async (e, {
    filepath,
    sourceCode,
    update_file,
    lang
  }) => {
    try {
      //write the updated code to the filesystem.
      await DirectoryActions.writeToFile(filepath.trim(), sourceCode);
    } catch (e) {
      throw e;
    }

    console.log(" written to successfully ");
    if (update_file) await LanProcess.updateCode({
      sourceCode,
      path: filepath,
      language: lang
    });
  }); //in the instance when the user wishes to run the rendered gui of the
  //code they're editing.

  ipcMain.on(E.RUN_GUI, async (e, {
    filepath,
    project,
    sourceCode
  }) => {
    let indexPath;

    switch (project) {
      case 'html':
        indexPath = _PROJECTS[project];
        console.log(" indexPath ", indexPath); //set up of the process window.

        return ProcessWindowSetup({
          indexpath: indexPath.index,
          processData: {
            sourceCode,
            filepath
          }
        });

      case 'javascript':
        indexPath = _PROJECTS[project];
        return LanProcess.guiStartup().catch(e => {
          console.log(' error occured ', e);
          return;
        }).then(async project_data => {
          if (LanProcess.project_init_complete) {
            //javascript process dependencies.
            let _dependencies = LanProcess.getDependencies();

            ipcSend(mainWindow, E.PROJECT_DEP, _dependencies); //return process window setup.console.log(" javascript index path ",indexPath);

            return ProcessWindowSetup({
              indexpath: indexPath.index,
              processData: project_data
            });
          }
        });
    }
  }); //in the instance when the gui is to be automatically updated

  ipcMain.on(E.UPDATE_GUI, async (e, {
    sourceCode,
    path,
    lang
  }) => {
    //we send updated source code to the renderer process of the gui.
    if (PROJECT_TYPE == 'javascript') {
      console.log(" project type is javascript");

      try {
        sourceCode = await LanProcess.updateCode({
          sourceCode,
          path,
          language: lang
        });
      } catch (e) {
        /** source code unable to be updated. */
        throw e;
      }
    }

    ipcSend(ProcessWindow, E.UPDATE_GUI, {
      sourceCode,
      path,
      lang
    });
  }); //in the instance when the gui process is requested to be stoppped.

  ipcMain.on(E.STOP_GUI, () => {
    try {
      ProcessWindow.close();
      process_started = false;
    } catch (e) {
      /* process window no longer runnnig*/
      throw e;
    }
  });
} catch (e) {
  logger.error(e);
  throw e;
}

unhandled();
//# sourceMappingURL=main.js.map
