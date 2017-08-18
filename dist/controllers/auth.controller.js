'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authenticate = undefined;

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _boom = require('boom');

var _lodash = require('lodash');

var _user = require('../database/models/user.model');

var _user2 = _interopRequireDefault(_user);

var _config = require('../config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var authenticate = exports.authenticate = function authenticate(request, reply) {
  return _user2.default.findOne({
    email: (0, _lodash.get)(request, 'payload.email', '')
  }).exec().then(function (user) {
    if ((0, _lodash.isNull)(user)) {
      return reply((0, _boom.notFound)(new Error('User not found')));
    }
    return user;
  }).then(function (user) {
    return user.comparePassword((0, _lodash.get)(request, 'payload.password', '')).then(function (res) {
      if (!res) {
        return reply((0, _boom.forbidden)(new Error('Password is wrong')));
      }
      return reply({
        token: _jsonwebtoken2.default.sign(user.profile, (0, _lodash.get)(_config.api, 'secret', ''))
      });
    });
  }).catch(function (err) {
    return (0, _boom.badImplementation)(err);
  });
};