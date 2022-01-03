"use strict";

const {
  ipcRenderer
} = require("electron");

const E = require("./events");

const _path = require("path");
/** functionality moniters and handles code updates to the child gui process. */


const languages = {
  '.html': 'html',
  '.js': "javascript",
  ".css": "css"
};
const ProcessGUI = {
  /** manages the updating of the renderer gui. */
  init(saveFunc, AppState, language = '', options = {
    interval: 200
  }) {
    this._lang = language;
    this._time = -1;
    this._int = options.interval;
    this.updateInterval = null;
    this._saveFunc = saveFunc;
    this._appState = AppState;
    this._process_running = false;
  },

  /**set language currently in use in the project. */
  setLanguage(lang) {
    this._lang = lang;
  },

  /** functionality which moniters changes to the gui then sends appropriate updates to main process. */
  monitorUpdate() {
    this._process_running = true;
    this.updateInterval = setInterval(() => {
      if (this._time <= 0) return;

      if (Date.now() - this._time > this._int) {
        this.updateCode(); //reset time to -1.

        this._time = -1;
      }
    }, this._int);
  },

  isProcessRenderering() {
    return this._process_running;
  },

  //if process is running or not.

  /* functionality which updates code. */
  updateCode() {
    let {
      sourceCode,
      path
    } = this._appState.session.currentSourceCode;

    let dependencies = this._appState.getDependencies(); //update gui.
    //console.log(" updating code ");


    console.log(" current dependencies ", dependencies, " current path ", path);

    if (dependencies.includes(path)) {
      console.log(" gui being updated.. ");
      ipcRenderer.send(E.UPDATE_GUI, {
        sourceCode,
        path,
        lang: languages[_path.extname(path)]
      });
    } //save the file to the file system.


    this._saveFunc({
      filepath: path,
      sourceCode,
      update_code: false
    });
  },

  /** functionality for updating time. */
  updateTime() {
    this._time = Date.now();
  },

  /* stop gui monitering process --> this likely means gui process has been killed */
  stopMonitoring() {
    clearInterval(this.updateInterval);
    this._time = -1;
    this._process_running = false;
  }

};
module.exports = ProcessGUI;
//# sourceMappingURL=ChildProcessUpdater.js.map
