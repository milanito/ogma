'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.update = exports.detail = exports.register = exports.list = undefined;

var _boom = require('boom');

var _lodash = require('lodash');

var _user = require('../database/models/user.model');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var list = exports.list = function list(request, reply) {
  return _user2.default.find().exec().then(function (users) {
    return reply((0, _lodash.map)(users, function (user) {
      return user.profile;
    }));
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};

var register = exports.register = function register(request, reply) {
  return _user2.default.create((0, _lodash.get)(request, 'payload', {})).then(function (user) {
    return reply(user.profile).code(201);
  }).catch(function (err) {
    return reply((0, _boom.conflict)(err));
  });
};

var detail = exports.detail = function detail(request, reply) {
  return _user2.default.findById((0, _lodash.get)(request, 'params.id', '')).exec().then(function (user) {
    if ((0, _lodash.isNull)(user)) {
      return reply((0, _boom.notFound)(new Error('User not found')));
    }
    return reply(user.profile);
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};

var update = exports.update = function update(request, reply) {
  return _user2.default.findById((0, _lodash.get)(request, 'params.id', '')).exec().then(function (user) {
    if ((0, _lodash.isNull)(user)) {
      return reply((0, _boom.notFound)(new Error('User not found')));
    }
    return (0, _lodash.merge)((0, _lodash.clone)(user), (0, _lodash.omit)((0, _lodash.get)(request, 'payload', {}), ['_id', 'hash', 'password'])).save();
  }).then(function (user) {
    return reply(user.profile);
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};