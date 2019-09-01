(function (modules) {
    function require(name) {
      const [fn] = modules[name];
      const module={},exports={};
      fn(module, exports,(name)=>require(name));
      return exports;
    }
    require("./main");
  })({"./main": [
      function ( module, exports,require) {
        "use strict";

var _numbers = require("./numbers");

console.log('inside main:', _numbers.numbers);
      }
    ],"./numbers": [
      function ( module, exports,require) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var numbers = exports.numbers = 3;
      }
    ],})