import Joi from 'joi';
import { getLocales } from 'country-language';
import { keys, map, replace, forEach } from 'lodash';

import exporters from '../exporter';
import {
  exporterProject, exporterProjects, exporterClientProjects
} from '../controllers/export.controller';

/**
 * This function registers the server's routes
 * for export operations
 * @param { Object } server the Hapi server
 * @param { Object } options the plugin options
 * @param { Function } next the Hapi next function
 * @return { Promise } a promise that resolves the
 * server
 */
const exportRoutes = (server, options, next) => {
  forEach([{
    method: 'GET',
    path: '/project/{id}/locale/{locale}/type/{type}',
    handler: exporterProject,
    config: {
      auth: 'jwt',
      description: 'This route is used to export a project\'s locale translation in the given format',
      validate: {
        params: {
          id: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i),
          locale: Joi.string().only(map(getLocales(), locale => replace(locale, /-/g, '_'))),
          type: Joi.string().only(keys(exporters))
        }
      },
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user',
          }, {
            'credentials:role': 'client',
          }],
          apply: 'permit-overrides',
          policies:[{
            target: { 'credentials:role': 'admin' },
            apply: 'deny-overrides',
            rules: [{ effect: 'permit' }]
          }, {
            target: { 'credentials:role': 'user' },
            apply: 'deny-overrides',
            rules: [{ effect: 'permit' }]
          }, {
            target: { 'credentials:role': 'client' },
            apply: 'deny-overrides',
            rules: [{ effect: 'permit' }]
          }]
        }
      },
      response: {
        status: {
          200: Joi.alternatives(Joi.string(), Joi.object()),
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
    path: '/locale/{locale}/type/{type}',
    handler: exporterClientProjects,
    config: {
      auth: 'jwt',
      description: 'This route is used to export all the projects\'s locale translation in the given format for a client',
      validate: {
        params: {
          locale: Joi.string().only(map(getLocales(), locale => replace(locale, /-/g, '_'))),
          type: Joi.string().only(keys(exporters))
        }
      },
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'client',
          }],
          apply: 'deny-overrides',
          rules: [{ effect: 'permit' }]
        }
      },
      response: {
        status: {
          200: Joi.alternatives(Joi.string(), Joi.object()),
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
    method: 'POST',
    path: '/projects/locale/{locale}/type/{type}',
    handler: exporterProjects,
    config: {
      auth: 'jwt',
      description: 'This route is used to export some projects\'s locale translation in the given format',
      validate: {
        params: {
          locale: Joi.string().only(map(getLocales(), locale => replace(locale, /-/g, '_'))),
          type: Joi.string().only(keys(exporters))
        },
        payload: {
          projects: Joi.array()
          .items(Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i))
          .min(1).required()
        }
      },
      plugins: {
        rbac: {
          target: [{
            'credentials:role': 'admin'
          }, {
            'credentials:role': 'user',
          }, {
            'credentials:role': 'client',
          }],
          apply: 'permit-overrides',
          policies:[{
            target: { 'credentials:role': 'admin' },
            apply: 'deny-overrides',
            rules: [{ effect: 'permit' }]
          }, {
            target: { 'credentials:role': 'user' },
            apply: 'deny-overrides',
            rules: [{ effect: 'permit' }]
          }, {
            target: { 'credentials:role': 'client' },
            apply: 'deny-overrides',
            rules: [{ effect: 'permit' }]
          }]
        }
      },
      response: {
        status: {
          200: Joi.alternatives(Joi.string(), Joi.object()),
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
  }], def => server.route(def));

  next();
};

exportRoutes.attributes = {
  name: 'ExportRoutes'
};

export default exportRoutes;

