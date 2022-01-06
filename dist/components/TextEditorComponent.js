"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _javascript = _interopRequireDefault(require("../icons/javascript.jsx"));

var _CssIcon = _interopRequireDefault(require("../icons/CssIcon.jsx"));

var _HtmlIcon = _interopRequireDefault(require("../icons/HtmlIcon.jsx"));

var _JsonIcon = _interopRequireDefault(require("../icons/JsonIcon.jsx"));

var _Saved = _interopRequireDefault(require("../icons/Saved.jsx"));

var _UnSaved = _interopRequireDefault(require("../icons/UnSaved.jsx"));

var _runFile = _interopRequireDefault(require("../icons/runFile.jsx"));

var _CancelIcon = _interopRequireDefault(require("../icons/CancelIcon.jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const types = {
  'javascript': _javascript.default,
  'html': _HtmlIcon.default,
  'json': _JsonIcon.default,
  'css': _CssIcon.default
};

const OpenFilesComponent = ({
  showFile,
  closeFile,
  openFiles,
  currentFile
}) => {
  const FileComponents = Object.keys(openFiles).map((filename, index) => {
    let file = openFiles[filename]; //onclick function displays file contents when file name is clicked on.

    const onDisplay = () => {
      //if file is already the current file do not proceed further.
      return file.isCurrent || showFile({
        filepath: file.path,
        sourceCode: file.sourceCode,
        prevOpenFilePath: currentFile
      });
    };

    const onClose = () => {
      //in the event that user wishes to close the file.
      return closeFile(filename);
    };

    let FileIcon = types[file.fileType] || (() => {
      return '';
    });

    let Icon = file.isSaved ? _CancelIcon.default : () => {
      return '';
    };
    let className = file.isCurrent ? 'dashboard-file-name-current' : 'dashboard-file-name';
    return /*#__PURE__*/_react.default.createElement("div", {
      className: className,
      onClick: onDisplay,
      key: `${filename}-${index}`
    }, /*#__PURE__*/_react.default.createElement(FileIcon, {
      className: "file-icon",
      key: `${filename}-${file.fileType}-${index}`
    }), /*#__PURE__*/_react.default.createElement("span", null, filename), /*#__PURE__*/_react.default.createElement(Icon, {
      className: "file-icon",
      key: `${filename}-${index}-icon`,
      onClick: onClose
    }));
  });
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "file-dashboard "
  }, " ", FileComponents, " ");
};

OpenFilesComponent.propTypes = {
  showFile: _propTypes.default.func,
  openFiles: _propTypes.default.object,
  closeFile: _propTypes.default.func,
  currentFile: _propTypes.default.string
};

const TextEditor = ({
  saveFile,
  currentFile,
  editFile,
  data,
  isNew,
  runProjectRendering,
  isRunning,
  showFile,
  openFiles,
  closeFile,
  stopRenderering,
  project
}) => {
  let {
    sourceCode,
    path,
    name,
    fileType,
    isSaved
  } = data;
  let updateGUI = isRunning && project.dependencies.includes(path);

  let FileIcon = types[fileType] || (() => {
    return '';
  });

  let onClick = e => {
    console.log(" current source code ", sourceCode);
    return saveFile({
      filepath: path,
      sourceCode,
      update_code: updateGUI,
      lang: fileType
    });
  };

  let runFile = e => {
    return runProjectRendering({
      filepath: path,
      projecttype: project.type,
      sourceCode,
      filename: name
    });
  };

  let stopFile = e => {
    return stopRenderering();
  };

  if (isNew) {
    let code = document.getElementById("code");
    window.code = code;
    if (code) document.getElementById('code').value = sourceCode;
  } //onEdit function for when code is manipulated.


  let onEdit = e => {
    window.E = e;
    let doc = document.getElementById('code');
    window.Doc = doc;
    return editFile({
      sourceCode: doc.value,
      isRunning: updateGUI
    });
  };

  let FuncIcon = isRunning ? /*#__PURE__*/_react.default.createElement("span", {
    className: "file-stop",
    onClick: stopFile
  }, /*#__PURE__*/_react.default.createElement(_CancelIcon.default, {
    className: "cancel-icon"
  }), " stop child process.") : /*#__PURE__*/_react.default.createElement("span", {
    className: "file-run",
    onClick: runFile
  }, " ", /*#__PURE__*/_react.default.createElement(_runFile.default, {
    className: "run-icon"
  }), " run file "); //maintain automatic updating of gui when changes are made.

  let UnSaved = isSaved ? '' : /*#__PURE__*/_react.default.createElement(_UnSaved.default, {
    className: "unsaved-icon",
    key: "unsaved-icon"
  });
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "text-editor"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "col-md-12 file-data"
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "file-name "
  }, " ", name, UnSaved, " "), /*#__PURE__*/_react.default.createElement("span", {
    className: "file-type "
  }, " ", /*#__PURE__*/_react.default.createElement(FileIcon, {
    className: "file-icon"
  }), " file type ", fileType, " "), /*#__PURE__*/_react.default.createElement("span", {
    className: "file-button",
    onClick: onClick
  }, /*#__PURE__*/_react.default.createElement(_Saved.default, {
    className: "save-icon",
    autoFocus: false
  }), "save file."), FuncIcon), /*#__PURE__*/_react.default.createElement(OpenFilesComponent, {
    showFile: showFile,
    openFiles: openFiles,
    closeFile: closeFile,
    currentFile: currentFile
  }), /*#__PURE__*/_react.default.createElement("hr", {
    className: "horizontal"
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "col-md-12 text-editor"
  }, /*#__PURE__*/_react.default.createElement("textarea", {
    id: "code",
    spellCheck: false,
    autoFocus: false,
    onInput: onEdit //onKeyDown={onEdit}
    ,
    "data-source": sourceCode,
    defaultValue: sourceCode
  })));
};

TextEditor.propTypes = {
  data: _propTypes.default.object,
  saveFile: _propTypes.default.func,
  editFile: _propTypes.default.func,
  isNew: _propTypes.default.bool,
  project: _propTypes.default.object,
  runProjectRendering: _propTypes.default.func,
  updateProjectRendering: _propTypes.default.func,
  isRunning: _propTypes.default.bool,
  time: _propTypes.default.number,
  currentFile: _propTypes.default.string,
  showFile: _propTypes.default.func,
  closeFile: _propTypes.default.func,
  openFiles: _propTypes.default.object,
  stopRenderering: _propTypes.default.func
};
var _default = TextEditor;
exports.default = _default;
//# sourceMappingURL=TextEditorComponent.js.map
