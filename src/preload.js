const E = require("./events");
const ApplicationState = require("./db/index");
const { contextBridge,ipcRenderer } = require("electron");
const logger = require("electron-log");
//contextBridge.exposeInMainWorld("darkMode",{ toggle:ipcRenderer.invoke(E.UI_MODE_TOGGLE) })
ipcRenderer.on(E.APP_STARTUP,async () => {
    //initialize application state.
    logger.info(" startup ");
    ApplicationState.onApplicationStart().then(mode => { 
        return ipcRenderer.send(E.UI_READY,mode); 
    });

})