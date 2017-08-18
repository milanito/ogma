'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exporter = undefined;

var _boom = require('boom');

var _lodash = require('lodash');

var _project = require('../database/models/project.model');

var _project2 = _interopRequireDefault(_project);

var _exporter = require('../exporter');

var _exporter2 = _interopRequireDefault(_exporter);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _exportLocale = function _exportLocale(_ref, type, pKeys) {
  var code = _ref.code,
      keys = _ref.keys;
  return (0, _lodash.get)(_exporter2.default, type, _lodash.identity)(keys, pKeys, code);
};

var exporter = exports.exporter = function exporter(request, reply) {
  return _project2.default.findOne((0, _lodash.merge)({
    _id: (0, _lodash.get)(request, 'params.id', '')
  }, (0, _helpers.projectsListQuery)((0, _lodash.get)(request, 'auth.credentials', {}), true))).exec().then(function (project) {
    if ((0, _lodash.isNull)(project)) {
      return reply((0, _boom.notFound)(new Error('Project not found')));
    }
    var idx = (0, _lodash.findIndex)((0, _lodash.get)(project, 'locales', []), function (locale) {
      return (0, _lodash.isEqual)((0, _lodash.get)(locale, 'code', ''), (0, _lodash.get)(request, 'params.locale', ''));
    });

    if ((0, _lodash.isEqual)(idx, -1)) {
      return reply((0, _boom.notFound)(new Error('Locale is not in project')));
    }

    return reply(_exportLocale((0, _lodash.nth)((0, _lodash.get)(project, 'locales', []), idx), (0, _lodash.get)(request, 'params.type', ''), (0, _lodash.get)(project, 'keys', [])));
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};