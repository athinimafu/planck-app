"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _javascript = _interopRequireDefault(require("/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/javascript.jsx"));

var _CssIcon = _interopRequireDefault(require("/home/uncle-shaggu/programs/projects/planck/planck_app/dist/icons/CssIcon.jsx"));

var _HtmlIcon = _interopRequireDefault(require("home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/HtmlIcon.jsx"));

var _JsonIcon = _interopRequireDefault(require("home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/JsonIcon.jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const types = {
  'javascript': _javascript.default,
  'html': _HtmlIcon.default,
  'json': _JsonIcon.default,
  'css': _CssIcon.default
};

const TextEditor = ({
  saveFile,
  data
}) => {
  //let className = full ? "col-md-12":""
  let {
    sourceCode,
    path,
    fileType
  } = data;
  let FileIcon = types[fileType] != undefined ? types[fileType] : () => {
    return '';
  };

  let onClick = ({
    sourceCode,
    path
  }) => {
    return saveFile(sourceCode, path);
  };

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "col-md-8"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "col-md-12 file-data"
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "file-name col-md-6"
  }, " ", path), /*#__PURE__*/_react.default.createElement("span", {
    className: "file-type offset-md-3"
  }, " ", /*#__PURE__*/_react.default.createElement(FileIcon, {
    className: "file-icon"
  }), " file type ", fileType, " "), /*#__PURE__*/_react.default.createElement("span", {
    className: "offset-md-9"
  }, /*#__PURE__*/_react.default.createElement("button", {
    className: "save-button btn",
    onClick: onClick
  }, " save file. "))), /*#__PURE__*/_react.default.createElement("div", {
    className: "col-md-12 text-editor"
  }, /*#__PURE__*/_react.default.createElement("code", {
    id: "code",
    "data-source": sourceCode
  }, " ", sourceCode)));
};

TextEditor.propTypes = {
  sourceCode: _propTypes.default.string,
  data: _propTypes.default.object
};
var _default = TextEditor;
exports.default = _default;
//# sourceMappingURL=TextEditorComponent.jsx.map
