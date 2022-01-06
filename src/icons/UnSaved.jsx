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

const UnSaved = props => {
  return /*#__PURE__*/_react.default.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    height: "18",
    width: "18",
    viewBox: "0 0 18 18"
  }, props), /*#__PURE__*/_react.default.createElement("g", {
    //fill: "#494c4e",
    "fillRule": "evenodd"
  }, /*#__PURE__*/_react.default.createElement("path", {
    d: "M17.85 3.15l-2.99-3A.507.507 0 0 0 14.5 0H1.4A1.417 1.417 0 0 0 0 1.43v15.14A1.417 1.417 0 0 0 1.4 18h15.2a1.417 1.417 0 0 0 1.4-1.43V3.5a.469.469 0 0 0-.15-.35zM16 16H2V5.9c.194.089.406.133.62.13h7.76A1.626 1.626 0 0 0 12 4.41V2h1.88L16 4.13V16z"
  }), /*#__PURE__*/_react.default.createElement("circle", {
    cx: "9",
    cy: "11",
    r: "3"
  })));
};

var _default = UnSaved;
exports.default = _default;
//# sourceMappingURL=UnSaved.jsx.map
