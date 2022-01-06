"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _CancelIcon = _interopRequireDefault(require("../icons/CancelIcon.jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Model = ({
  func,
  cancelFunc,
  type
}) => {
  console.log(" node type ", type);

  function onSubmit() {
    let newNode = document.getElementById('new-node').value;
    console.log(' new file value ', newNode);
    return func(newNode, type);
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "new-node-modal col-md-12"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "new-node-modal-content"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "new-node-header col-md-12"
  }, " new ", type, " name ", /*#__PURE__*/_react.default.createElement(_CancelIcon.default, {
    className: "file-cancel-icon",
    onClick: cancelFunc
  }), "  "), /*#__PURE__*/_react.default.createElement("input", {
    className: "new-node-input",
    id: "new-node",
    spellCheck: false
  }), /*#__PURE__*/_react.default.createElement("button", {
    className: " new-node btn-default",
    onClick: onSubmit
  }, " create. ")));
};

Model.propTypes = {
  func: _propTypes.default.func,
  cancelFunc: _propTypes.default.func,
  type: _propTypes.default.string
};
var _default = Model;
exports.default = _default;
//# sourceMappingURL=Model.view.js.map
