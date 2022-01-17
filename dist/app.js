"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _renderer = _interopRequireDefault(require("./renderer.js"));

var _components = _interopRequireDefault(require("./components"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class App extends _react.default.Component {
  constructor() {
    //initialize application session.
    super(); //set application state

    console.log(" start here ");

    _renderer.default._initState(this);

    _renderer.default.getApplicationState().then(db => {
      console.log(" database ", db);
      this.updateState(db);
    }); //initialize application state.

  }

  updateState(db) {
    this.setState({ ..._renderer.default,
      appData: { ...db
      }
    });
  }

  render() {
    return /*#__PURE__*/_react.default.createElement(_components.default, this.state);
  }

}

exports.default = App;
//# sourceMappingURL=app.js.map
