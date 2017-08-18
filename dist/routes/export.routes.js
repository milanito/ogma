'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _export = require('../controllers/export.controller');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This function registers the server's routes
 * for export operations
 * @param { Object } server the Hapi server
 * @return { Promise } a promise that resolves the
 * server
 */
var exportRoutes = function exportRoutes(server, options, next) {
  server.route({
    method: 'GET',
    path: '/project/{id}/locale/{locale}/type/{type}',
    handler: _export.exporter
  });
  next();
};

exportRoutes.attributes = {
  name: 'ExportRoutes'
};

exports.default = exportRoutes;