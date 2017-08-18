'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _flatjson = require('./flatjson');

var _flatjson2 = _interopRequireDefault(_flatjson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (keys, pKeys) {
  return (0, _lodash.join)((0, _lodash.reduce)((0, _flatjson2.default)(keys, pKeys), function (total, value, key) {
    if ((0, _lodash.isEmpty)(total)) {
      total.push('"Key","Translation"');
    }
    total.push('"' + key + '","' + value + '"');
    return total;
  }, []), '\n');
};