'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _config = require('../config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = _bluebird2.default;

/**
 * This function connects to the dabase
 * @returns { Promise } a promise that resolves
 */

exports.default = function () {
  return new _bluebird2.default(function (resolve, reject) {
    _mongoose2.default.connect(_config.database.uri, _config.database.options);
    var db = _mongoose2.default.connection;
    db.on('error', function (err) {
      return reject(err);
    });
    db.once('open', function () {
      return resolve(true);
    });
  });
};