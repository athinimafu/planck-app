const E = require("./events");
const ApplicationState = require("./db/index");
const { contextBridge,ipcRenderer } = require("electron");

//contextBridge.exposeInMainWorld("darkMode",{ toggle:ipcRenderer.invoke(E.UI_MODE_TOGGLE) })
ipcRenderer.on(E.APP_STARTUP,async () => {
    //initialize application state.
    console.log(" startup ");
    ApplicationState.onApplicationStart().then(mode => { 
        console.log(" startup ",mode);
        return ipcRenderer.send(E.UI_READY,mode); 
    });

})