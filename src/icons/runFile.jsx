"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

const RunFile = props => {
  return /*#__PURE__*/_react.default.createElement("svg", _extends({
    viewBox: "0 0 16 16",
    xmlns: "http://www.w3.org/2000/svg",
    fill: "currentColor"
  }, props), /*#__PURE__*/_react.default.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M10.915 8.24L2 14.48V2l8.915 6.24zm-7.92 4.328L9.181 8.24 2.995 3.912v8.656zM5.5 14.48v-1.229l7.18-5.01L5.5 3.228V2l8.915 6.24L5.5 14.48z"
  }));
};

var _default = RunFile;
exports.default = _default;
//# sourceMappingURL=runFile.jsx.map
