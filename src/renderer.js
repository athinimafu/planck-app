const { ipcRenderer } = require("electron")
const GUIUpdater = require("./ChildProcessUpdater");
const ApplicationState = require("./db");
const E = require("./events");
const _path = require('path');

/** in the case of an application startup we set application ui 
 * according to one of 3 possible cases:
 *  -"FIRST TIME":
 *    ---if it's the first time we on hello world page and prompt user to open a file.
 *  -"NO OPEN WORKING DIRECTORY":
 *    --- in the case where there is no open working directory
 *    --- we prompt the user to open a work directory.
 *  -"OPEN WORKING DIRECTORY":  
 *    --- in the case there is a working directory we open code that was previously being opened.
 * */
/** contains application state along with functionality  */
let $funcs = ApplicationState.functionality;
window.ApplicationState = ApplicationState;
/** project dependencies are recieved from the main process. */
ipcRenderer.on(E.PROJECT_DEP,(e,dep) => { 
    console.log(" dependencies init ",dep);
    ApplicationState.updateProjectDependencies(dep) 
})

/** in the event that a new file is being created. */
ipcRenderer.on(E.NEW_FILE,(e,{canceled,filePaths}) => {
    if (canceled) { return; }
    ApplicationState.newNodeCreationPrompt(filePaths[0],'file');
})

/** in the event that a new folder is being created. */
ipcRenderer.on(E.NEW_FOLDER,(e,{ canceled,filePaths }) => {
    if (canceled) { return;}
    ApplicationState.newNodeCreationPrompt(filePaths[0],'directory');
})

ipcRenderer.on(E.OPEN_FILES_PRESENT,(e,openFiles) => {
    //update all the open files.
    ApplicationState.updateOpenFiles(openFiles);
})

ipcRenderer.on(E.PROCESS_STOPPED, e => {
    ApplicationState.updateGUIState([ { key:"isRunning",value:false } ])   //set the gui state flag to not running
})

/** in the event where knowledge of whether directory is already open is needed.*/
ipcRenderer.on(E.DIR_PRESENT,async (e) => {
    let currentDirectory,project,openFiles;
    try {
        //current directory.
        currentDirectory = (await ApplicationState.getDBValues('currentDirectory')) || {};
        project          = (await ApplicationState.getDBValues('project')) || {};
        openFiles        = (await ApplicationState.getDBValues('openFiles')) || {};
    }
    catch(e) {}
    console.log(" open files ",openFiles);
    if ( Object.keys(openFiles).length > 0 ) {
        ipcRenderer.send(E.OPEN_FILES_PRESENT,openFiles);
    }
    //also determine whether a currentFile already exists.
    ApplicationState.currentFileDetermination();
    console.log(" currentDirectory ",currentDirectory);

    if (currentDirectory.path) {
        currentDirectory = _path.resolve(currentDirectory.path,currentDirectory.name);
        ApplicationState.openDirectory(currentDirectory,project.type,true);
        ApplicationState.getOpenFilesData();;
        ipcRenderer.send(E.DIR_PRESENT,{currentDirectory,PROJECT_TYPE:project.type });
    }
})

/**save current file being worked on. */
ipcRenderer.on(E.SAVE_FILE,async () => {
    let fileObject;
    try {
        fileObject = await ApplicationState.fetchFile();
    }
    catch(e) {
        console.log(" unable to fetch file from front-end db. ",e);
        return;
    }
    let { path,sourceCode,update_code,fileType } = fileObject;
    //save file to sys call.
    return saveFiletoSys({ filepath:path,sourceCode,update_code,lang:fileType });
})

//gui updater.
GUIUpdater.init(saveFiletoSys,ApplicationState);

function saveFiletoSys({filepath,sourceCode,update_code,lang }) {
    //send sourcecode and filepath to main process to be saved to the filesystem.
    
    ipcRenderer.send(E.SAVE_FILE,{ filepath,sourceCode,lang,update_file:update_code && !GUIUpdater.isProcessRenderering() });
    //update application state.
    if (update_code && GUIUpdater.isProcessRenderering() ) /** update gui's code. */
        GUIUpdater.updateCode();
    //save file.
    $funcs.saveFile();
}

const functionality = {
    openDirectory(projecttype) 
    {
        //initialize gui process updater.
        return ipcRenderer.invoke(E.OPEN_DIR_PROMPT,projecttype).then(data => {
            let { canceled,filePaths }  = data;
            //if user canceled open directory prompt return.
            if (canceled == true) return;
            //call ApplicationState.
            ApplicationState.openDirectory(filePaths[0],projecttype,false);
        });
    },
    ...$funcs,
    async openFile(filepath,prevOpenFilePath,newlyCreated=false) {
        console.log(' filepath ',filepath);
        let code = await ipcRenderer.invoke(E.OPEN_FILE,{ filepath,newlyCreated });
        //once source code is found.
        return $funcs.openFile({ filepath,sourceCode:code,prevOpenFilePath,newlyCreated });
    },
    //showFile changes current file to from current file to file given to function.
    //showFile takes in object {filepath:string,sourceCode:string,prevOpenFilePath:string}
    async showFile(object) { return $funcs.openFile(object); }, 
    saveFiletoSys,
    //functionality for when a person wishes to render the code's gui.
    runProjectRendering({filepath,projecttype,sourceCode }) 
    {
        //tell gui process updater that gui has been renderered.
        //gui process handler will begin monitering gui process.
        GUIUpdater.monitorUpdate();
        ApplicationState.updateGUIState([ { key:"isRunning",value:true}, ]);
        switch(projecttype) {
            case 'html':
                ApplicationState.updateProjectDependencies([ filepath ]);
                break;
        }
        return ipcRenderer.send(E.RUN_GUI,{ filepath,project:projecttype,sourceCode });
    },
    stopRenderering() 
    {
        //kill gui monitoring process.
        GUIUpdater.stopMonitoring();
        //stop the current rendering process which is running.
        ApplicationState.updateGUIState(
            [ { key:"isRunning",value:false } ]
        );
        //send message to main process to stop child process from running.
        return ipcRenderer.send(E.STOP_GUI);
    },
    //functionality to edit gui.
    editFile({ sourceCode,language,isRunning }) 
    {
        if (isRunning) /* if gui process is running we update it. */
            {GUIUpdater.updateTime(); console.log(" running code "); }
        return $funcs.editFile({ sourceCode,isRunning,language });
    },
    //functionality for creating a new file.
    createNode(nodename,type) 
    {
        let { nodepath } = ApplicationState.session.newNode;
        //send absolute path of file to main process.
        console.log(" filepath ",nodepath);
        switch(type) {
        case 'file': 
            ipcRenderer.send(E.NEW_FILE,_path.resolve(nodepath,nodename));
            break;
        case 'directory': 
            ipcRenderer.send(E.NEW_FOLDER,_path.resolve(nodepath,nodename));
            break;
        }
        return $funcs.createNode(nodename);
    }
}
module.exports = {
    /** @param{$self} React.Component instance ties application state and functionality to Application ui. */
    ...ApplicationState,
    /** functionality prompts user to select a working directory. */
    functionality
    
}