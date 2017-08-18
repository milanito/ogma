import Joi from 'joi';

import { healthCheck } from '../controllers/misc.controller';

/**
 * This function registers the server's routes
 * for misc operations
 * @param { Object } server the Hapi server
 * @param { Object } options the plugin options
 * @param { Function } next the Hapi next function
 * @return { Promise } a promise that resolves the
 * server
 */
const miscRoutes = (server, options, next) => {
  server.route({
    method: 'GET',
    path: '/health-check',
    handler: healthCheck,
    config: {
      auth: false,
      description: 'This route is used to check the state of the API',
      response: {
        status: {
          200: Joi.string()
        }
      }
    },
  });
  next();
};

miscRoutes.attributes = {
  name: 'MiscRoutes'
};

export default miscRoutes;
