"use strict";

const db = require("./db");

const session = require("./sessionState");

const SysDirectory = require("../directory");

let _self;

let $this;
module.exports = {
  //on the start of the application.
  session,

  async onApplicationStart() {
    return this.getApplicationState().then(db => {
      this.currentFileDetermination();
      return db.mode;
    });
  },

  async currentFileDetermination() {
    let currentFile;

    try {
      currentFile = await db.getValue('currentFile');
    } catch (e) {}

    if (currentFile) {
      this.setSessionState([{
        key: "currentSourceCode",
        value: {
          path: currentFile.path.trim(),
          sourceCode: currentFile.sourceCode
        }
      }]);
    }
  },

  /**
   * @param{$self} React Application Component instance state.
   * _initApplicationState -- > initializes the application state.
  * enable application state to implement ui updates using the 
  * application's react ui component state.
  */
  async _initState($self) {
    _self = $self;
    $this = this;
  },

  //function returns the last working directory
  async getApplicationState() {
    return await db.getDB();
  },

  //set project dependencies of the project.
  async updateProjectDependencies(dep) {
    this.setSessionState([{
      key: "dependencies",
      value: dep
    }]);
    return await db.updateProjectDependencies(dep);
  },

  //functionality to obtain db values.
  async getDBValues(value) {
    return await db.getValue(value);
  },

  //read open files source code.
  async getOpenFilesData() {
    let openFiles = {},
        updatedOpenedFiles = {};

    try {
      openFiles = await this.getDBValues('openFiles');
    } catch (e) {
      console.log(" error occured while getting open files ", e);
    }

    await Promise.all(Object.keys(openFiles).map(async file => {
      let filepath = openFiles[file].path;
      let sourceCode;

      try {
        sourceCode = await SysDirectory.readFromFile(filepath);
      } catch (e) {}

      ;
      updatedOpenedFiles[file] = { ...openFiles[file],
        sourceCode
      };
    }));
    return db.updateProjectOpenFiles({
      updatedOpenFiles: updatedOpenedFiles
    });
  },

  getDependencies() {
    return this.session.dependencies;
  },

  async setSessionState(values) {
    values.forEach(({
      key,
      value
    }) => {
      this.session[key] = value;
    });
    return true;
  },

  async updateGUIState(values) {
    return this.stateChange(this.setSessionState(values));
  },

  /** @param{promise} function<Promise{}> promise argument is a function which returns a promise as its
   * return value -> once the promise resolves ui is updated.
  */
  stateChange(promise) {
    return promise.then(async () => {
      let database;

      try {
        database = await this.getApplicationState();
      } catch (e) {
        console.error(e);
      } //update React component ui state.


      return _self.updateState({ ...this.session,
        ...database
      });
    });
  },

  //functionality which opens up a directory and returns all nodes of directory tree.
  async openDirectory(directory_path, dir_type, map_dir) {
    let dir = {};

    try {
      dir = await SysDirectory.openDirectory(directory_path);
    } catch (e) {
      console.log(`directory unable to be loaded ${e}`);
      return;
    }

    return this.stateChange(db.newDirectory(directory_path, dir, dir_type, map_dir));
  },

  //functionality for fetching the current file being worked on.
  async fetchFile() {
    //save database file.
    if (this.session.currentSourceCode.path.length == 0) return;
    this.functionality.saveFile();
    let project = {};

    try {
      project = await db.getValue("project");
    } catch (e) {
      console.log(" error occured ", e);
    } //return file currently being worked on.


    return db.getValue('currentFile').then(file => {
      return { ...file,
        update_code: project.dependencies.includes(file.path)
      };
    });
  },

  //functionality updates open files object.
  async updateOpenFiles(openFiles) {
    return this.stateChange(db.setValue("openFiles", openFiles));
  },

  //inform ui state of creation of a new file.
  async newNodeCreationPrompt(nodepath, type) {
    console.log(' creating node in filepath ', nodepath);
    return this.stateChange(this.setSessionState([{
      key: "newNodeCreation",
      value: true
    }, {
      key: 'newNode',
      value: {
        nodepath,
        type
      }
    }]));
  },

  functionality: {
    //functionality which opens a specific file.
    //functionality calls database file to perform read  operation of file source.
    async openFile({
      filepath,
      sourceCode,
      prevOpenFilePath,
      newlyCreated
    }) {
      console.log(' file path ', filepath);
      $this.setSessionState([{
        key: "currentSourceCode",
        value: {
          path: filepath,
          sourceCode
        }
      }]);
      return await $this.stateChange(db.openFile({
        filepath,
        sourceCode,
        prevOpenFilePath,
        newlyCreated
      }));
    },

    //functionality that enables the expanding of a folder's contents and hiding them aswell.
    async toggleFolder(folderpath) {
      return await $this.stateChange(db.toggleFolder(folderpath));
    },

    //close file closes the file pasts as an argument.
    async closeFile(filename) {
      let currentFile;

      try {
        currentFile = await db.closeFile({
          filename
        });
      } catch (e) {} //set value of current source code.


      return $this.stateChange($this.setSessionState([{
        key: "currentSourceCode",
        value: {
          sourceCode: currentFile.sourceCode || '',
          path: currentFile.path
        }
      }]));
    },

    //closeDirectory functionality closes the directory.
    async closeDirectory() {
      //closed directory.
      SysDirectory.closeDirectory();
      return await $this.stateChange(db.closeCurrentDirectory());
    },

    //functionality for when the current file is being edited.
    async editFile({
      sourceCode,
      isRunning
    }) {
      //console.log(' current source code ',$this.session.currentSourceCode);
      if (isRunning) $this.setSessionState([{
        key: 'currentSourceCode',
        value: { ...$this.session.currentSourceCode,
          sourceCode: sourceCode
        }
      }]);
      return await $this.stateChange(db.editFile(sourceCode));
    },

    //functionality for saving the current file being focused on.
    async saveFile() {
      return await $this.stateChange(db.saveFile());
    },

    async openProject({
      directoryPath,
      projectType
    }) {
      //simply return sysdirectory open directory function with a html project type.
      return $this.openDirectory(directoryPath, projectType);
    },

    //cancel process of creating a new file.
    async cancelNodeCreation() {
      return $this.stateChange($this.setSessionState([{
        key: "newNodeCreation",
        value: false
      }, {
        key: "newNode",
        value: null
      }]));
    },

    //create file functionality.
    async createNode(nodename) {
      let {
        nodepath,
        type
      } = $this.session.newNode;
      $this.setSessionState([{
        key: "newNodeCreation",
        value: false
      }, {
        key: "newNode",
        value: null
      }]);
      return $this.stateChange(db.newNode({
        nodename,
        nodepath,
        nodetype: type
      }));
    },

    /** toggles directory view */
    toggleDirectoryView() {
      return $this.stateChange($this.setSessionState([{
        key: "viewDir",
        value: !$this.session.viewDir
      }]));
    }

  }
};
//# sourceMappingURL=index.js.map
