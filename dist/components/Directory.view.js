"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _javascript = _interopRequireDefault(require("../icons/javascript.jsx"));

var _closedFolder = _interopRequireDefault(require("../icons/closedFolder.jsx"));

var _openDir = _interopRequireDefault(require("../icons/openDir.jsx"));

var _HtmlIcon = _interopRequireDefault(require("../icons/HtmlIcon.jsx"));

var _JsonIcon = _interopRequireDefault(require("../icons/JsonIcon.jsx"));

var _CssIcon = _interopRequireDefault(require("../icons/CssIcon.jsx"));

var _CancelIcon = _interopRequireDefault(require("../icons/CancelIcon.jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

let fileTypes = {
  'javascript': _javascript.default,
  'html': _HtmlIcon.default,
  'json': _JsonIcon.default,
  'css': _CssIcon.default
};
let DirectoryComponents = [];

const FileComponent = ({
  isSaved,
  fileType,
  path,
  name,
  level,
  openFile,
  currentFile,
  newlyCreated
}) => {
  //console.log(" file type ",fileType);
  let FileIcon = fileTypes[fileType] != undefined ? fileTypes[fileType] : () => {
    return '';
  }; //console.log(" file icon ",FileIcon);

  let isSavedBlob = isSaved ? '' : /*#__PURE__*/_react.default.createElement("span", {
    className: "is-saved"
  });
  return /*#__PURE__*/_react.default.createElement("p", {
    className: "list-default",
    onClick: () => openFile(`${path}/${name}`, currentFile, newlyCreated)
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "level"
  }, " ", level, " "), /*#__PURE__*/_react.default.createElement(FileIcon, {
    className: "file-icon"
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: "file-pointer"
  }, name), isSavedBlob);
};

FileComponent.propTypes = {
  isSaved: _propTypes.default.bool,
  fileType: _propTypes.default.string,
  path: _propTypes.default.string,
  name: _propTypes.default.string,
  level: _propTypes.default.string,
  openFile: _propTypes.default.func,
  currentFile: _propTypes.default.string,
  newlyCreated: _propTypes.default.bool
};

const FolderComponent = ({
  toggleFolder,
  path,
  isExpanded,
  level,
  name
}) => {
  let FolderIcon = isExpanded ? _openDir.default : _closedFolder.default;

  const onClick = () => {
    return toggleFolder(path.concat(`/${name}`));
  };

  return /*#__PURE__*/_react.default.createElement("p", {
    className: "list-default",
    onClick: onClick
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "level"
  }, " ", level, " "), /*#__PURE__*/_react.default.createElement(FolderIcon, {
    className: "folder-icon"
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: "folder-name"
  }, " ", name, " "), "/");
};

FolderComponent.propTypes = {
  toggleFolder: _propTypes.default.func,
  path: _propTypes.default.string,
  isExpanded: _propTypes.default.bool,
  level: _propTypes.default.string,
  name: _propTypes.default.string
};

const Components = ({
  directory,
  level,
  openFile,
  toggleFolder,
  currentFile
}) => {
  Object.keys(directory).map((dir, index) => {
    if (directory[dir].isdir) {
      DirectoryComponents.push( /*#__PURE__*/_react.default.createElement(FolderComponent, {
        key: `folder-${dir}-${index}-${Math.random()}`,
        path: directory[dir].path,
        isExpanded: directory[dir].isExpanded,
        name: dir,
        level: `${level}__`,
        toggleFolder: toggleFolder,
        openFile: openFile
      }));
      if (!directory[dir].isExpanded) return ''; //console.log(" directory ",dir," children ",directory[dir].children);

      return Components({
        directory: directory[dir].children,
        level: `${level}__`,
        openFile,
        toggleFolder,
        currentFile
      });
    } else {
      DirectoryComponents.push( /*#__PURE__*/_react.default.createElement(FileComponent, _extends({}, directory[dir], {
        key: `file-${dir}-${index}`,
        level: `${level}__`,
        openFile: openFile,
        name: dir,
        currentFile: currentFile
      })));
    }
  });
};

const Directory = ({
  directory,
  openFile,
  full,
  toggleFolder,
  path,
  closeDirectory,
  currentFile
}) => {
  const className = full ? "col-md-12 side" : "directory-side"; //obtain Components.
  //console.log(" directory children ",directory.children);

  let displayName = full ? path : path.split('/')[path.split('/').length];
  let dirName = full ? 'offset-md-1 col-md-6' : '';
  if (DirectoryComponents.length > 0) DirectoryComponents = [];
  Components({
    directory: directory.children,
    level: '|',
    openFile,
    toggleFolder,
    currentFile
  });
  return /*#__PURE__*/_react.default.createElement("div", {
    className: className
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "col-md-12"
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "file-path"
  }, " ", displayName, " "), /*#__PURE__*/_react.default.createElement(_CancelIcon.default, {
    className: "cancel-icon",
    onClick: closeDirectory
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: `directory ${dirName}`
  }, " ", DirectoryComponents));
};

Directory.propTypes = {
  directory: _propTypes.default.object,
  openFile: _propTypes.default.func,
  full: _propTypes.default.bool,
  toggleFolder: _propTypes.default.func,
  path: _propTypes.default.string,
  closeDirectory: _propTypes.default.func,
  currentFile: _propTypes.default.string
};
var _default = Directory;
exports.default = _default;
//# sourceMappingURL=Directory.view.js.map
