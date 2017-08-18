'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _project = require('../controllers/project.controller');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This function registers the server's routes
 * for project
 * @param { Object } server the Hapi server
 * @return { Promise } a promise that resolves the
 * server
 */
var projectRoutes = function projectRoutes(server, options, next) {
  (0, _lodash.forEach)([{
    method: 'GET',
    path: '/',
    handler: _project.list,
    config: {
      auth: 'jwt',
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user'
          }],
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'POST',
    path: '/',
    handler: _project.create,
    config: {
      auth: 'jwt',
      validate: {
        payload: {
          name: _joi2.default.string().required()
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
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'GET',
    path: '/{id}',
    handler: _project.detail,
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
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'DELETE',
    path: '/{id}',
    handler: _project.deleteProject,
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
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'GET',
    path: '/{id}/keys',
    handler: _project.getKeys,
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
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'POST',
    path: '/{id}/keys',
    handler: _project.addKeys,
    config: {
      auth: 'jwt',
      validate: {
        params: {
          id: _joi2.default.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        },
        payload: {
          keys: _joi2.default.array().min(1).items(_joi2.default.string().required())
        }
      },
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user'
          }],
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'PATCH',
    path: '/{id}/keys',
    handler: _project.updateKeys,
    config: {
      auth: 'jwt',
      validate: {
        params: {
          id: _joi2.default.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        },
        payload: {
          keys: _joi2.default.object().required()
        }
      },
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user'
          }],
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'DELETE',
    path: '/{id}/keys',
    handler: _project.deleteKeys,
    config: {
      auth: 'jwt',
      validate: {
        params: {
          id: _joi2.default.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        },
        payload: {
          keys: _joi2.default.array().min(1).items(_joi2.default.string().required())
        }
      },
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user'
          }],
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'GET',
    path: '/{id}/users',
    handler: _project.getUsers,
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
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'POST',
    path: '/{id}/users',
    handler: _project.addUser
  }, {
    method: 'PATCH',
    path: '/{id}/users/{userid}/{role}',
    handler: _project.updateUser
  }, {
    method: 'DELETE',
    path: '/{id}/users/{userid}',
    handler: _project.deleteUser
  }, {
    method: 'GET',
    path: '/{id}/locales',
    handler: _project.getLocales
  }, {
    method: 'POST',
    path: '/{id}/locales',
    handler: _project.addLocale
  }, {
    method: 'PATCH',
    path: '/{id}/locales/{locale}',
    handler: _project.updateLocale
  }, {
    method: 'DELETE',
    path: '/{id}/locales/{locale}',
    handler: _project.deleteLocale
  }], function (def) {
    return server.route(def);
  });

  next();
};

projectRoutes.attributes = {
  name: 'ProjectRoutes'
};

exports.default = projectRoutes;