"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _WelcomeComponent = _interopRequireDefault(require("./WelcomeComponent"));

var _Directory = _interopRequireDefault(require("./Directory.view"));

var _TextEditorComponent = _interopRequireDefault(require("./TextEditorComponent"));

var _Model = _interopRequireDefault(require("./Model.view"));

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const A = {
  DIR_OPEN: "DIRECTORY-OPEN",
  DIR_CLOSED: "DIRECTORY-CLOSED",
  FILE_OPEN: "FILE-OPEN"
};

const AppContainerComponent = ({
  session,
  appData,
  functionality
}) => {
  if (appData == null) return ''; //console.log(" current session state ",session);

  let {
    isRunning,
    time,
    newNodeCreation,
    newNode
  } = session;
  let {
    openFile,
    toggleFolder,
    closeDirectory,
    saveFiletoSys,
    editFile,
    runProjectRendering,
    showFile,
    closeFile,
    stopRenderering,
    createNode,
    cancelNodeCreation
  } = functionality;
  let {
    appState,
    currentDirectory,
    currentFile,
    prevAction,
    project,
    openFiles
  } = appData;
  let componentState = {};
  let AppComponents = [];
  let main = '';

  if (newNodeCreation) {
    AppComponents = AppComponents.concat( /*#__PURE__*/_react.default.createElement(_Model.default, {
      func: createNode,
      cancelFunc: cancelNodeCreation,
      type: newNode.type
    }));
  }

  switch (appState) {
    case A.DIR_OPEN:
      componentState = {
        directory: currentDirectory,
        openFile,
        toggleFolder,
        full: true,
        path: currentDirectory.path,
        closeDirectory
      };
      AppComponents.push( /*#__PURE__*/_react.default.createElement(_Directory.default, componentState));
      break;

    case A.DIR_CLOSED:
      break;

    case A.FILE_OPEN:
      componentState = {
        directory: currentDirectory,
        saveFile: saveFiletoSys,
        toggleFolder,
        editFile,
        full: false,
        data: currentFile,
        isNew: prevAction == "open",
        project,
        currentFile: currentFile.path,
        runProjectRendering,
        isRunning,
        time,
        showFile,
        closeFile,
        openFiles,
        stopRenderering
      };
      AppComponents.push( /*#__PURE__*/_react.default.createElement(_TextEditorComponent.default, componentState));
      AppComponents.push( /*#__PURE__*/_react.default.createElement(_Directory.default, _extends({}, componentState, {
        openFile: openFile,
        closeDirectory: closeDirectory,
        path: currentDirectory.path,
        key: "dir-one"
      })));
      main = 'main';
      break;

    default:
      componentState = {
        openDirectory: functionality.openDirectory
      };
      AppComponents.push( /*#__PURE__*/_react.default.createElement(_WelcomeComponent.default, _extends({}, componentState, {
        key: "welcome-one"
      })));
      break;
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: `col-md-12 ${main} basic-default`
  }, AppComponents);
};

AppContainerComponent.propTypes = {
  appData: _propTypes.default.object,
  functionality: _propTypes.default.object,
  session: _propTypes.default.object
};
var _default = AppContainerComponent;
exports.default = _default;
//# sourceMappingURL=index.js.map
