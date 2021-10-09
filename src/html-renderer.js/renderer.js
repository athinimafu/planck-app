const { ipcRenderer } = require("electron");
const E = require("../events");


ipcRenderer.on(E.RUN_GUI,(e,{sourceCode,filepath }) => {
    //console.log(" source code ",sourceCode);
    document.getElementById("app").innerHTML = sourceCode;
    //inform main process that process window is ready.
    ipcRenderer.send(E.UI_READY,'process');
})

ipcRenderer.on(E.UPDATE_GUI,(e,{ sourceCode }) => {
    //update to inner html of the source code.
    document.getElementById("app").innerHTML = sourceCode;
})

