'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _flatjson = require('./flatjson');

var _flatjson2 = _interopRequireDefault(_flatjson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (keys, pKeys) {
  return (0, _lodash.join)(['<?xml version="1.0" encoding="UTF-8"?>', '<resources>', (0, _lodash.join)((0, _lodash.map)((0, _flatjson2.default)(keys, pKeys), function (value, key) {
    return '<string name="' + key + '">' + value + '</string>';
  }), '\n'), '</resources>'], '\n');
};