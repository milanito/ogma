import Joi from 'joi';
import { forEach } from 'lodash';

import {
  createUser, listUsers, detailMe, detailUser,
  updateUser, deleteUser
} from '../controllers/user.controller';

/**
 * This function registers the server's routes
 * for user
 * @param { Object } server the Hapi server
 * @param { Object } options the plugin options
 * @param { Function } next the Hapi next function
 * @return { Promise } a promise that resolves the
 * server
 */
const userRoutes = (server, options, next) => {
  forEach([{
    method: 'GET',
    path: '/',
    handler: listUsers,
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
    handler: createUser,
    config: {
      auth: 'jwt',
      validate: {
        payload: {
          email: Joi.string().email().required(),
          username: Joi.string().required(),
          role: Joi.string().valid(['user', 'admin']),
          password: Joi.string().required()
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
    path: '/me',
    handler: detailMe,
    config: {
      auth: 'jwt',
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user',
          }],
          apply: 'permit-overrides',
          policies: [{
            target: { 'credentials:role': 'admin' },
            apply: 'deny-overrides',
            rules: [{ effect: 'permit' }]
          }, {
            target: { 'credentials:role': 'user' },
            apply: 'deny-overrides',
            rules: [{ effect: 'permit' }]
          }]
        }
      }
    },
  }, {
    method: 'GET',
    path: '/{id}',
    handler: detailUser,
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
          apply: 'permit-overrides',
          policies: [{
            target: { 'credentials:role': 'admin' },
            apply: 'deny-overrides',
            rules: [{ effect: 'permit' }]
          }, {
            target: { 'credentials:role': 'user' },
            apply: 'permit-overrides',
            rules:[{
              target: { 'credentials:_id': { field: 'params:id' } },
              effect: 'permit'
            }, {
              effect: 'deny'
            }]
          }]
        }
      }
    },
  }, {
    method: 'PATCH',
    path: '/{id}',
    handler: updateUser,
    config: {
      auth: 'jwt',
      validate: {
        params: {
          id: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        },
        payload: {
          email: Joi.string().email().optional().description('New user email'),
          password: Joi.string().optional().description('New user password'),
          role: Joi.string().valid(['user', 'admin']),
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
          policies: [{
            target: { 'credentials:role': 'admin' },
            apply: 'deny-overrides',
            rules: [{ effect: 'permit' }]
          }, {
            target: { 'credentials:role': 'user' },
            apply: 'permit-overrides',
            rules:[{
              target: { 'credentials:_id': { field: 'params:id' } },
              effect: 'permit'
            }, {
              effect: 'deny'
            }]
          }]
        }
      }
    },
  }, {
    method: 'DELETE',
    path: '/{id}',
    handler: deleteUser,
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
          }],
          apply: 'permit-overrides',
          policies: [{
            target: { 'credentials:role': 'admin' },
            apply: 'deny-overrides',
            rules: [{ effect: 'permit' }]
          }]
        }
      }
    },
  }], def => server.route(def));

  next();
};

userRoutes.attributes = {
  name: 'UserRoutes'
};

export default userRoutes;
