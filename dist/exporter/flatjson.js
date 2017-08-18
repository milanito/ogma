'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

exports.default = function (keys, pKeys) {
  return (0, _lodash.reduce)(pKeys, function (total, pKey) {
    var item = {};
    item[pKey] = (0, _lodash.get)(keys, pKey, '');
    return (0, _lodash.merge)((0, _lodash.clone)(total), item);
  }, {});
};