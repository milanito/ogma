'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteLocale = exports.updateLocale = exports.addLocale = exports.getLocales = exports.deleteUser = exports.updateUser = exports.addUser = exports.getUsers = exports.deleteKeys = exports.updateKeys = exports.addKeys = exports.getKeys = exports.deleteProject = exports.detail = exports.create = exports.list = undefined;

var _httpStatus = require('http-status');

var _boom = require('boom');

var _lodash = require('lodash');

var _project = require('../database/models/project.model');

var _project2 = _interopRequireDefault(_project);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var list = exports.list = function list(request, reply) {
  return _project2.default.find((0, _helpers.projectsListQuery)((0, _lodash.get)(request, 'auth.credentials', {}))).exec().then(function (projects) {
    return reply((0, _lodash.map)(projects, function (project) {
      return project.small;
    }));
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};

var create = exports.create = function create(request, reply) {
  return _project2.default.create((0, _lodash.merge)((0, _lodash.clone)((0, _lodash.get)(request, 'payload', {})), {
    users: [{
      user: (0, _lodash.get)(request, 'auth.credentials._id', ''),
      role: 'owner'
    }]
  })).then(function (project) {
    return reply(project.small).code(_httpStatus.CREATED);
  }).catch(function (err) {
    return reply((0, _boom.conflict)(err));
  });
};

var detail = exports.detail = function detail(request, reply) {
  return _project2.default.findOne((0, _lodash.merge)({
    _id: (0, _lodash.get)(request, 'params.id', '')
  }, (0, _helpers.projectsListQuery)((0, _lodash.get)(request, 'auth.credentials', {})))).populate('users.user').exec().then(function (project) {
    if ((0, _lodash.isNull)(project)) {
      return reply((0, _boom.notFound)(new Error('Project not found')));
    }
    return reply(project.small);
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};

var deleteProject = exports.deleteProject = function deleteProject(request, reply) {
  return _project2.default.findOne((0, _lodash.merge)({
    _id: (0, _lodash.get)(request, 'params.id', '')
  }, (0, _helpers.projectsListQuery)((0, _lodash.get)(request, 'auth.credentials', {}), true))).exec().then(function (project) {
    if ((0, _lodash.isNull)(project)) {
      return reply((0, _boom.notFound)(new Error('Project not found')));
    }
    return _project2.default.remove({ _id: (0, _lodash.get)(request, 'params.id', '') }).exec();
  }).then(function () {
    return reply('Deleted').code(_httpStatus.ACCEPTED);
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};

var getKeys = exports.getKeys = function getKeys(request, reply) {
  return _project2.default.findOne((0, _lodash.merge)({
    _id: (0, _lodash.get)(request, 'params.id', '')
  }, (0, _helpers.projectsListQuery)((0, _lodash.get)(request, 'auth.credentials', {})))).exec().then(function (project) {
    if ((0, _lodash.isNull)(project)) {
      return reply((0, _boom.notFound)(new Error('Project not found')));
    }
    return reply((0, _lodash.get)(project, 'keys', []));
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};

var addKeys = exports.addKeys = function addKeys(request, reply) {
  return _project2.default.findOne((0, _lodash.merge)({
    _id: (0, _lodash.get)(request, 'params.id', '')
  }, (0, _helpers.projectsListQuery)((0, _lodash.get)(request, 'auth.credentials', {}), true))).exec().then(function (project) {
    if ((0, _lodash.isNull)(project)) {
      return reply((0, _boom.notFound)(new Error('Project not found')));
    }
    (0, _lodash.set)(project, 'keys', (0, _lodash.uniq)((0, _lodash.union)((0, _lodash.get)(project, 'keys', []), (0, _lodash.get)(request, 'payload.keys', []))));
    project.markModified('keys');
    return project.save().then(function (project) {
      return reply(project.keys);
    });
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};

var updateKeys = exports.updateKeys = function updateKeys(request, reply) {
  return _project2.default.findOne((0, _lodash.merge)({
    _id: (0, _lodash.get)(request, 'params.id', '')
  }, (0, _helpers.projectsListQuery)((0, _lodash.get)(request, 'auth.credentials', {}), true))).exec().then(function (project) {
    if ((0, _lodash.isNull)(project)) {
      return reply((0, _boom.notFound)(new Error('Project not found')));
    }

    (0, _lodash.set)(project, 'keys', (0, _lodash.uniq)((0, _lodash.union)((0, _lodash.filter)((0, _lodash.get)(project, 'keys', []), function (key) {
      return (0, _lodash.isEqual)((0, _lodash.indexOf)((0, _lodash.keys)((0, _lodash.get)(request, 'payload.keys', {})), key), -1);
    }), (0, _lodash.values)((0, _lodash.get)(request, 'payload.keys', {})))));

    (0, _lodash.set)(project, 'locales', (0, _lodash.map)(project.locales, function (locale) {
      (0, _lodash.set)(locale, 'keys', (0, _lodash.reduce)(locale.keys, function (total, value, key) {
        if (!(0, _lodash.isEqual)((0, _lodash.indexOf)((0, _lodash.keys)((0, _lodash.get)(request, 'payload.keys', {})), key), -1)) {
          (0, _lodash.set)(total, (0, _lodash.get)((0, _lodash.get)(request, 'payload.keys', {}), key, ''), value);
        } else {
          (0, _lodash.set)(total, key, value);
        }
        return total;
      }, {}));
      return locale;
    }));

    project.markModified('keys');
    project.markModified('locales');
    return project.save().then(function (project) {
      return reply(project.keys);
    });
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};

var deleteKeys = exports.deleteKeys = function deleteKeys(request, reply) {
  return _project2.default.findOne((0, _lodash.merge)({
    _id: (0, _lodash.get)(request, 'params.id', '')
  }, (0, _helpers.projectsListQuery)((0, _lodash.get)(request, 'auth.credentials', {}), true))).exec().then(function (project) {
    if ((0, _lodash.isNull)(project)) {
      return reply((0, _boom.notFound)(new Error('Project not found')));
    }
    project.keys = (0, _lodash.filter)((0, _lodash.get)(project, 'keys', []), function (key) {
      return (0, _lodash.isEqual)((0, _lodash.indexOf)((0, _lodash.get)(request, 'payload.keys', []), key), -1);
    });

    project.locales = (0, _lodash.map)(project.locales, function (locale) {
      locale.keys = (0, _lodash.omit)(locale.keys, (0, _lodash.get)(request, 'payload.keys', []));
      return locale;
    });

    project.markModified('keys');
    project.markModified('locales');
    return project.save().then(function (project) {
      return reply(project.keys).code(_httpStatus.ACCEPTED);
    });
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};

var getUsers = exports.getUsers = function getUsers(request, reply) {
  return _project2.default.findOne((0, _lodash.merge)({
    _id: (0, _lodash.get)(request, 'params.id', '')
  }, (0, _helpers.projectsListQuery)((0, _lodash.get)(request, 'auth.credentials', {}), true))).populate('users.user').exec().then(function (project) {
    if ((0, _lodash.isNull)(project)) {
      return reply((0, _boom.notFound)(new Error('Project not found')));
    }
    return reply((0, _lodash.map)(project.users, function (user) {
      return (0, _lodash.merge)((0, _lodash.pick)((0, _lodash.get)(user, 'user', {}), ['_id', 'username', 'email']), (0, _lodash.pick)(user, ['role']));
    }));
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};

var addUser = exports.addUser = function addUser(request, reply) {
  return _project2.default.findOne((0, _lodash.merge)({
    _id: (0, _lodash.get)(request, 'params.id', '')
  }, (0, _helpers.projectsListQuery)((0, _lodash.get)(request, 'auth.credentials', {}), true))).exec().then(function (project) {
    if ((0, _lodash.isNull)(project)) {
      return reply((0, _boom.notFound)(new Error('Project not found')));
    }
    var idx = (0, _lodash.findIndex)(project.users, function (usr) {
      return (0, _lodash.isEqual)((0, _lodash.get)(usr, 'user', ''), (0, _lodash.get)(request, 'payload.user', ''));
    });

    if (idx > -1) {
      return reply((0, _boom.conflict)(new Error('User already in project')));
    }
    project.users.push((0, _lodash.get)(request, 'payload', {}));
    project.markModified('users');

    return project.save().then(function (project) {
      return reply((0, _lodash.map)(project.users, function (user) {
        return (0, _lodash.merge)((0, _lodash.pick)((0, _lodash.get)(user, 'user', {}), ['_id', 'username', 'email']), (0, _lodash.pick)(user, ['role']));
      }));
    });
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};

var updateUser = exports.updateUser = function updateUser(request, reply) {
  return _project2.default.findOne((0, _lodash.merge)({
    _id: (0, _lodash.get)(request, 'params.id', '')
  }, (0, _helpers.projectsListQuery)((0, _lodash.get)(request, 'auth.credentials', {}), true))).exec().then(function (project) {
    if ((0, _lodash.isNull)(project)) {
      return reply((0, _boom.notFound)(new Error('Project not found')));
    }
    var idx = (0, _lodash.findIndex)((0, _lodash.get)(project, 'users', []), function (usr) {
      return (0, _lodash.isEqual)((0, _lodash.get)(usr, 'user', ''), (0, _lodash.get)(request, 'params.userid', ''));
    });

    if ((0, _lodash.isEqual)(idx, -1)) {
      return reply((0, _boom.notFound)(new Error('User is not in project')));
    }
    (0, _lodash.set)(project.users[idx], role, (0, _lodash.get)(request, 'params.role', ''));
    project.markModified('users');

    return project.save().then(function (project) {
      return reply((0, _lodash.map)(project.users, function (user) {
        return (0, _lodash.merge)((0, _lodash.pick)((0, _lodash.get)(user, 'user', {}), ['_id', 'username', 'email']), (0, _lodash.pick)(user, ['role']));
      }));
    });
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};

var deleteUser = exports.deleteUser = function deleteUser(request, reply) {
  return _project2.default.findOne((0, _lodash.merge)({
    _id: (0, _lodash.get)(request, 'params.id', '')
  }, (0, _helpers.projectsListQuery)((0, _lodash.get)(request, 'auth.credentials', {}), true))).exec().then(function (project) {
    if ((0, _lodash.isNull)(project)) {
      return reply((0, _boom.notFound)(new Error('Project not found')));
    }
    var idx = (0, _lodash.findIndex)(project.users, function (usr) {
      return (0, _lodash.isEqual)((0, _lodash.get)(usr, 'user', ''), (0, _lodash.get)(request, 'payload.user', ''));
    });

    if ((0, _lodash.isEqual)(idx, -1)) {
      return reply((0, _boom.notFound)(new Error('User is not in project')));
    }

    project.users.splice(idx, 1);
    project.markModified('users');

    return project.save().then(function (project) {
      return reply((0, _lodash.map)(project.users, function (user) {
        return (0, _lodash.merge)((0, _lodash.pick)((0, _lodash.get)(user, 'user', {}), ['_id', 'username', 'email']), (0, _lodash.pick)(user, ['role']));
      })).code(_httpStatus.ACCEPTED);
    });
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};

var getLocales = exports.getLocales = function getLocales(request, reply) {
  return _project2.default.findOne((0, _lodash.merge)({
    _id: (0, _lodash.get)(request, 'params.id', '')
  }, (0, _helpers.projectsListQuery)((0, _lodash.get)(request, 'auth.credentials', {})))).exec().then(function (project) {
    if ((0, _lodash.isNull)(project)) {
      return reply((0, _boom.notFound)(new Error('Project not found')));
    }
    return reply((0, _lodash.get)(project, 'locales', []));
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};

var addLocale = exports.addLocale = function addLocale(request, reply) {
  return _project2.default.findOne((0, _lodash.merge)({
    _id: (0, _lodash.get)(request, 'params.id', '')
  }, (0, _helpers.projectsListQuery)((0, _lodash.get)(request, 'auth.credentials', {}), true))).exec().then(function (project) {
    if ((0, _lodash.isNull)(project)) {
      return reply((0, _boom.notFound)(new Error('Project not found')));
    }
    var idx = (0, _lodash.findIndex)((0, _lodash.get)(project, 'locales', []), function (locale) {
      return (0, _lodash.isEqual)((0, _lodash.get)(locale, 'code', ''), (0, _lodash.get)(request, 'payload.locale', ''));
    });

    if (idx > -1) {
      return reply((0, _boom.conflict)(new Error('Locale already in project')));
    }
    project.locales.push({ code: (0, _lodash.get)(request, 'payload.locale', {}) });
    project.markModified('locales');

    return project.save().then(function () {
      return reply((0, _lodash.get)(project, 'locales', []));
    });
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};

var updateLocale = exports.updateLocale = function updateLocale(request, reply) {
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

    if ((0, _lodash.size)((0, _lodash.filter)((0, _lodash.keys)((0, _lodash.get)(request, 'payload', {})), function (key) {
      return (0, _lodash.isEqual)((0, _lodash.indexOf)((0, _lodash.get)(project, 'keys', []), key), -1);
    })) > 0) {
      return reply((0, _boom.forbidden)(new Error('Keys are missing in project')));
    }

    (0, _lodash.forEach)((0, _lodash.get)(request, 'payload', {}), function (value, key) {
      return (0, _lodash.set)((0, _lodash.get)((0, _lodash.nth)((0, _lodash.get)(project, 'locales', []), idx), 'keys', {}), key, value);
    });

    project.markModified('locales');

    return project.save().then(function () {
      return reply((0, _lodash.get)(project, 'locales', []));
    });
  }).catch(function (err) {
    return reply((0, _boom.badImplementation)(err));
  });
};

var deleteLocale = exports.deleteLocale = function deleteLocale(request, reply) {
  return reply('ok');
};