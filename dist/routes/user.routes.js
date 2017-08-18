'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _lodash = require('lodash');

var _user = require('../controllers/user.controller');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This function registers the server's routes
 * for user
 * @param { Object } server the Hapi server
 * @return { Promise } a promise that resolves the
 * server
 */
var userRoutes = function userRoutes(server, options, next) {
  (0, _lodash.forEach)([{
    method: 'GET',
    path: '/',
    handler: _user.list,
    config: {
      auth: 'jwt',
      plugins: {
        rbac: {
          target: { 'credentials:role': 'admin' },
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'POST',
    path: '/',
    handler: _user.register,
    config: {
      auth: 'jwt',
      validate: {
        payload: {
          email: _joi2.default.string().email().required(),
          username: _joi2.default.string().required(),
          role: _joi2.default.string().valid(['user', 'admin']),
          password: _joi2.default.string().required()
        }
      },
      plugins: {
        rbac: {
          target: { 'credentials:role': 'admin' },
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'GET',
    path: '/{id}',
    handler: _user.detail,
    config: {
      auth: 'jwt',
      validate: {
        params: {
          id: _joi2.default.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        }
      },
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user'
          }],
          apply: 'permit-overrides',
          policies: [{
            target: { 'credentials:role': 'admin' },
            apply: 'deny-overrides',
            rules: [{ effect: 'permit' }]
          }, {
            target: { 'credentials:role': 'user' },
            apply: 'permit-overrides',
            rules: [{
              target: { 'credentials:_id': { field: 'params:id' } },
              effect: 'permit'
            }, {
              effect: 'deny'
            }]
          }]
        }
      }
    }
  }, {
    method: 'PATCH',
    path: '/{id}',
    handler: _user.update,
    config: {
      auth: 'jwt',
      validate: {
        params: {
          id: _joi2.default.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        }
      },
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user'
          }],
          apply: 'permit-overrides',
          policies: [{
            target: { 'credentials:role': 'admin' },
            apply: 'deny-overrides',
            rules: [{ effect: 'permit' }]
          }, {
            target: { 'credentials:role': 'user' },
            apply: 'permit-overrides',
            rules: [{
              target: { 'credentials:_id': { field: 'params:id' } },
              effect: 'permit'
            }, {
              effect: 'deny'
            }]
          }]
        }
      }
    }
  }], function (def) {
    return server.route(def);
  });

  next();
};

userRoutes.attributes = {
  name: 'UserRoutes'
};

exports.default = userRoutes;