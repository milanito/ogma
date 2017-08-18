import Joi from 'joi';
import Promise from 'bluebird';
import { forEach } from 'lodash';

import {
  create, list, detail, deleteProject,
  getKeys, addKeys, updateKeys, deleteKeys,
  getUsers, addUser, updateUser, deleteUser,
  getLocales, addLocale, updateLocale, deleteLocale,
} from '../controllers/project.controller';

/**
 * This function registers the server's routes
 * for project
 * @param { Object } server the Hapi server
 * @return { Promise } a promise that resolves the
 * server
 */
const projectRoutes = (server, options, next) => {
  forEach([{
    method: 'GET',
    path: '/',
    handler: list,
    config: {
      auth: 'jwt',
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user',
          }],
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'POST',
    path: '/',
    handler: create,
    config: {
      auth: 'jwt',
      validate: {
        payload: {
          name: Joi.string().required()
        }
      },
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user',
          }],
          apply: 'permit-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'GET',
    path: '/{id}',
    handler: detail,
    config: {
      auth: 'jwt',
      validate: {
        params: {
          id: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        }
      },
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user',
          }],
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'DELETE',
    path: '/{id}',
    handler: deleteProject,
    config: {
      auth: 'jwt',
      validate: {
        params: {
          id: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        }
      },
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user',
          }],
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'GET',
    path: '/{id}/keys',
    handler: getKeys,
    config: {
      auth: 'jwt',
      validate: {
        params: {
          id: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        }
      },
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user',
          }],
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'POST',
    path: '/{id}/keys',
    handler: addKeys,
    config: {
      auth: 'jwt',
      validate: {
        params: {
          id: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        },
        payload: {
          keys: Joi.array().min(1).items(Joi.string().required())
        }
      },
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user',
          }],
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'PATCH',
    path: '/{id}/keys',
    handler: updateKeys,
    config: {
      auth: 'jwt',
      validate: {
        params: {
          id: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        },
        payload: {
          keys: Joi.object().required()
        }
      },
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user',
          }],
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'DELETE',
    path: '/{id}/keys',
    handler: deleteKeys,
    config: {
      auth: 'jwt',
      validate: {
        params: {
          id: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        },
        payload: {
          keys: Joi.array().min(1).items(Joi.string().required())
        }
      },
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user',
          }],
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'GET',
    path: '/{id}/users',
    handler: getUsers,
    config: {
      auth: 'jwt',
      validate: {
        params: {
          id: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        }
      },
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user',
          }],
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    }
  }, {
    method: 'POST',
    path: '/{id}/users',
    handler: addUser
  }, {
    method: 'PATCH',
    path: '/{id}/users/{userid}/{role}',
    handler: updateUser
  }, {
    method: 'DELETE',
    path: '/{id}/users/{userid}',
    handler: deleteUser
  }, {
    method: 'GET',
    path: '/{id}/locales',
    handler: getLocales
  }, {
    method: 'POST',
    path: '/{id}/locales',
    handler: addLocale
  }, {
    method: 'PATCH',
    path: '/{id}/locales/{locale}',
    handler: updateLocale
  }, {
    method: 'DELETE',
    path: '/{id}/locales/{locale}',
    handler: deleteLocale
  }], def => server.route(def));

  next();
};

projectRoutes.attributes = {
  name: 'ProjectRoutes'
};

export default projectRoutes;

