'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

exports.default = function (keys, pKeys) {
  return (0, _lodash.reduce)(pKeys, function (total, pKey) {
    return (0, _lodash.set)((0, _lodash.clone)(total), pKey, (0, _lodash.get)(keys, pKey, ''));
  }, {});
};