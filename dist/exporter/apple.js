'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

exports.default = function (keys, pKeys) {
  return (0, _lodash.join)((0, _lodash.map)(pKeys, function (pKey) {
    return (0, _lodash.join)(['"' + pKey + '"', '"' + (0, _lodash.get)(keys, pKey, '') + '"'], ' = ');
  }), '\n');
};