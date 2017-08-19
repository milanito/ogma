import Joi from 'joi';
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
 * @param { Object } options the plugin options
 * @param { Function } next the Hapi next function
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
    handler: addUser,
    config: {
      auth: 'jwt',
      validate: {
        params: {
          id: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i).description('The project ID')
        },
        payload: {
          user: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i).description('The user ID'),
          role: Joi.string().only(['editor', 'normal']).description('The user role in project')
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
      },
      response: {
        status: {
          200: Joi.any(),
          400: Joi.object().keys({
            statusCode: Joi.number(),
            error: Joi.string(),
            message: Joi.string()
          }),
          409: Joi.object().keys({
            statusCode: Joi.number(),
            error: Joi.string(),
            message: Joi.string()
          }),
          404: Joi.object().keys({
            statusCode: Joi.number(),
            error: Joi.string(),
            message: Joi.string()
          })
        }
      }
    }
  }, {
    method: 'PATCH',
    path: '/{id}/users',
    handler: updateUser,
    config: {
      auth: 'jwt',
      validate: {
        params: {
          id: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i).description('The project ID')
        },
        payload: {
          user: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i).description('The user ID'),
          role: Joi.string().only(['editor', 'normal']).description('The new user role in project')
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
      },
      response: {
        status: {
          200: Joi.any(),
          400: Joi.object().keys({
            statusCode: Joi.number(),
            error: Joi.string(),
            message: Joi.string()
          }),
          404: Joi.object().keys({
            statusCode: Joi.number(),
            error: Joi.string(),
            message: Joi.string()
          })
        }
      }
    }
  }, {
    method: 'DELETE',
    path: '/{id}/users',
    handler: deleteUser,
    config: {
      auth: 'jwt',
      validate: {
        params: {
          id: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i).description('The project ID')
        },
        payload: {
          user: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i).description('The user ID'),
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
      },
      response: {
        status: {
          202: Joi.any(),
          400: Joi.object().keys({
            statusCode: Joi.number(),
            error: Joi.string(),
            message: Joi.string()
          }),
          404: Joi.object().keys({
            statusCode: Joi.number(),
            error: Joi.string(),
            message: Joi.string()
          })
        }
      }
    }
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
    path: '/{id}/locales',
    handler: updateLocale
  }, {
    method: 'DELETE',
    path: '/{id}/locales',
    handler: deleteLocale
  }], def => server.route(def));

  next();
};

projectRoutes.attributes = {
  name: 'ProjectRoutes'
};

export default projectRoutes;

