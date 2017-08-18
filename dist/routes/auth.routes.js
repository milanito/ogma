'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _lodash = require('lodash');

var _auth = require('../controllers/auth.controller');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This function registers the server's routes
 * for user authentication
 * @param { Object } server the Hapi server
 * @return { Promise } a promise that resolves the
 * server
 */
var authRoutes = function authRoutes(server, options, next) {
  (0, _lodash.forEach)([{
    method: 'POST',
    path: '/',
    handler: _auth.authenticate,
    config: {
      auth: false,
      description: 'This route is used to authenticate the user',
      validate: {
        payload: {
          email: _joi2.default.string().email().required().description('User Email'),
          password: _joi2.default.string().required().description('User Password')
        }
      },
      response: {
        status: {
          200: _joi2.default.object().keys({ token: _joi2.default.string() }),
          400: _joi2.default.object().keys({
            statusCode: _joi2.default.number(),
            error: _joi2.default.string(),
            message: _joi2.default.string()
          }),
          403: _joi2.default.object().keys({
            statusCode: _joi2.default.number(),
            error: _joi2.default.string(),
            message: _joi2.default.string()
          }),
          404: _joi2.default.object().keys({
            statusCode: _joi2.default.number(),
            error: _joi2.default.string(),
            message: _joi2.default.string()
          })
        }
      }
    }
  }], function (def) {
    return server.route(def);
  });

  next();
};

authRoutes.attributes = {
  name: 'AuthRoutes'
};

exports.default = authRoutes;