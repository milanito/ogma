import Joi from 'joi';
import { getLocales } from 'country-language';
import { keys } from 'lodash';

import exporters from '../exporter';
import { exporter } from '../controllers/export.controller';

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
  server.route({
    method: 'GET',
    path: '/project/{id}/locale/{locale}/type/{type}',
    handler: exporter,
    config: {
      auth: 'jwt',
      description: 'This route is used to export a project\'s locale translation in the given format',
      validate: {
        params: {
          id: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i),
          locale: Joi.string().only(getLocales()),
          type: Joi.string().only(keys(exporters))
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
  });

  next();
};

exportRoutes.attributes = {
  name: 'ExportRoutes'
};

export default exportRoutes;

