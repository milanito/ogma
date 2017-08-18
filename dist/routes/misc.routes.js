'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _misc = require('../controllers/misc.controller');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This function registers the server's routes
 * for misc operations
 * @param { Object } server the Hapi server
 * @return { Promise } a promise that resolves the
 * server
 */
var miscRoutes = function miscRoutes(server, options, next) {
  server.route({
    method: 'GET',
    path: '/health-check',
    handler: _misc.healthCheck,
    config: {
      auth: false,
      description: 'This route is used to check the state of the API',
      response: {
        status: {
          200: _joi2.default.string()
        }
      }
    }
  });
  next();
};

miscRoutes.attributes = {
  name: 'MiscRoutes'
};

exports.default = miscRoutes;