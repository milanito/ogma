'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _user = require('./user.routes');

var _user2 = _interopRequireDefault(_user);

var _project = require('./project.routes');

var _project2 = _interopRequireDefault(_project);

var _auth = require('./auth.routes');

var _auth2 = _interopRequireDefault(_auth);

var _export = require('./export.routes');

var _export2 = _interopRequireDefault(_export);

var _misc = require('./misc.routes');

var _misc2 = _interopRequireDefault(_misc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ROUTERS = [{
  register: _user2.default,
  prefix: '/api/users'
}, {
  register: _project2.default,
  prefix: '/api/projects'
}, {
  register: _auth2.default,
  prefix: '/api/auth'
}, {
  register: _export2.default,
  prefix: '/api/export'
}, {
  register: _misc2.default,
  prefix: '/api'
}];

/**
 * This function registers the server's routes
 * @param { Object } server the Hapi server
 * @return { Promise } a prmise that resolves the
 * server
 */

exports.default = function (server) {
  return _bluebird2.default.all((0, _lodash.map)(ROUTERS, function (_ref) {
    var register = _ref.register,
        prefix = _ref.prefix;
    return new _bluebird2.default(function (resolve, reject) {
      return server.register({ register: register }, { routes: { prefix: prefix } }, function (err) {
        if (err) {
          return reject(err);
        }
        return resolve(true);
      });
    });
  })).then(function () {
    return new _bluebird2.default(function (resolve) {
      return resolve(server);
    });
  });
};