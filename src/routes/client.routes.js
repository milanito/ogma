import Joi from 'joi';
import { forEach } from 'lodash';

import {
  createClient, listClients, detailClient, updateClient, deleteClient
} from '../controllers/client.controller';

/**
 * This function registers the server's routes
 * for client
 * @param { Object } server the Hapi server
 * @param { Object } options the plugin options
 * @param { Function } next the Hapi next function
 * @return { Promise } a promise that resolves the
 * server
 */
const clientRoutes = (server, options, next) => {
  forEach([{
    method: 'GET',
    path: '/',
    handler: listClients,
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
    handler: createClient,
    config: {
      auth: 'jwt',
      validate: {
        payload: {
          name: Joi.string().required(),
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
    path: '/{id}',
    handler: detailClient,
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
            'credentials:role': 'user'
          }],
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    },
  }, {
    method: 'PATCH',
    path: '/{id}',
    handler: updateClient,
    config: {
      auth: 'jwt',
      validate: {
        params: {
          id: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        },
        payload: {
          token: Joi.boolean(),
          name: Joi.string().min(2)
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
    },
  }, {
    method: 'DELETE',
    path: '/{id}',
    handler: deleteClient,
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
            'credentials:role': 'user'
          }],
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      }
    },
  }], def => server.route(def));

  next();
};

clientRoutes.attributes = {
  name: 'ClientRoutes'
};

export default clientRoutes;

