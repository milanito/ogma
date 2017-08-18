import Promise from 'bluebird';

import { exporter } from '../controllers/export.controller';

/**
 * This function registers the server's routes
 * for export operations
 * @param { Object } server the Hapi server
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

