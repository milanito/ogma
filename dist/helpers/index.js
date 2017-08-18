'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.projectsListQuery = undefined;

var _lodash = require('lodash');

var projectsListQuery = exports.projectsListQuery = function projectsListQuery(_ref) {
  var _id = _ref._id,
      role = _ref.role;
  var isEditor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var query = {};
  if ((0, _lodash.isEqual)(role, 'user')) {
    (0, _lodash.merge)(query, { 'users.user': _id });

    if (isEditor) {
      (0, _lodash.merge)(query, { 'users.role': { $in: ['editor', 'owner'] } });
    }
  }

  return query;
};