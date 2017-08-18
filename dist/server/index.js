'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _hapiBunyan = require('hapi-bunyan');

var _hapiBunyan2 = _interopRequireDefault(_hapiBunyan);

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _brok = require('brok');

var _brok2 = _interopRequireDefault(_brok);

var _hapiAuthJwt = require('hapi-auth-jwt2');

var _hapiAuthJwt2 = _interopRequireDefault(_hapiAuthJwt);

var _hapiRbac = require('hapi-rbac');

var _hapiRbac2 = _interopRequireDefault(_hapiRbac);

var _vision = require('vision');

var _vision2 = _interopRequireDefault(_vision);

var _inert = require('inert');

var _inert2 = _interopRequireDefault(_inert);

var _lout = require('lout');

var _lout2 = _interopRequireDefault(_lout);

var _hapi = require('hapi');

var _lodash = require('lodash');

var _user = require('../database/models/user.model');

var _user2 = _interopRequireDefault(_user);

var _config = require('../config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PLUGINS = [{
  register: _hapiBunyan2.default,
  options: {
    logger: _bunyan2.default.createLogger(_config.log)
  }
}, {
  register: _brok2.default,
  options: {
    compress: { quality: 3 }
  }
}, {
  register: _hapiAuthJwt2.default
}, {
  register: _hapiRbac2.default
}, {
  register: _vision2.default
}, {
  register: _inert2.default
}, {
  register: _lout2.default
}];

var validateUser = function validateUser(decoded, request, callback) {
  return _user2.default.findById((0, _lodash.get)(decoded, '_id', '')).exec().then(function (user) {
    if ((0, _lodash.isNull)(user)) {
      return callback(null, false);
    }
    return callback(null, true);
  }).catch(function (err) {
    return callback(err);
  });
};

exports.default = function () {
  return new Promise(function (resolve, reject) {
    var server = new _hapi.Server();
    server.connection({ port: (0, _lodash.get)(_config.api, 'port', 0), host: (0, _lodash.get)(_config.api, 'host', '') });
    server.register(PLUGINS, function (err) {
      if (err) {
        return reject(err);
      }
      server.auth.strategy('jwt', 'jwt', {
        key: (0, _lodash.get)(_config.api, 'secret', ''),
        validateFunc: validateUser,
        verifyOptions: { algorithms: ['HS256'] }
      });
      server.auth.default('jwt');
      return resolve(server);
    });
  });
};