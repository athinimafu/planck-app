"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _openDir = _interopRequireDefault(require("/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/openDir.jsx"));

var _flower = _interopRequireDefault(require("/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/flower.jsx"));

var _edit = _interopRequireDefault(require("/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/edit.jsx"));

var _HtmlIcon = _interopRequireDefault(require("/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/HtmlIcon.jsx"));

var _JsIcon = _interopRequireDefault(require("/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/JsIcon.jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const WelcomeComponent = ({
  openDirectory,
  openFile
}) => {
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "welcome-component basic-default"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "col-md-12"
  }, /*#__PURE__*/_react.default.createElement("h1", {
    className: "welcome-prompt"
  }, " planck. "), /*#__PURE__*/_react.default.createElement("div", {
    className: "block-default"
  }, /*#__PURE__*/_react.default.createElement(_flower.default, {
    className: "flower"
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "col-md-12 block-raised"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "block-raised flow",
    onClick: () => openDirectory('html')
  }, /*#__PURE__*/_react.default.createElement(_HtmlIcon.default, {
    className: "block-raised"
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "block-raised flow",
    onClick: () => openDirectory('javascript')
  }, /*#__PURE__*/_react.default.createElement(_JsIcon.default, {
    className: "block-raised"
  })))));
};

WelcomeComponent.propTypes = {
  openDirectory: _propTypes.default.func,
  openFile: _propTypes.default.func
};
var _default = WelcomeComponent;
exports.default = _default;
//# sourceMappingURL=WelcomeComponent.js.map
