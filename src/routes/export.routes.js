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
    handler: exporter
  });

  next();
};

exportRoutes.attributes = {
  name: 'ExportRoutes'
};

export default exportRoutes;

