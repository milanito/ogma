import { ACCEPTED, CREATED } from 'http-status';
import {
  conflict, notFound, badImplementation, forbidden
} from 'boom';
import {
  get, omit, clone, merge, map, set, union,
  indexOf, transform, keys, pick, findIndex,
  isNull, isEqual, reduce, values, uniq, filter,
  size, nth, forEach
} from 'lodash';

import Project from '../database/models/project.model';
import { projectsListQuery } from '../helpers';

export const list = (request, reply) =>
  Project
  .find(projectsListQuery(get(request, 'auth.credentials', {})))
  .exec()
  .then(projects =>
    reply(map(projects, project => project.small)))
  .catch(err => reply(badImplementation(err)));

export const create = (request, reply) =>
  Project
  .create(merge(clone(get(request, 'payload', {})), {
    users: [{
      user: get(request, 'auth.credentials._id', ''),
      role: 'owner'
    }]
  }))
  .then(project => reply(project.small).code(CREATED))
  .catch(err => reply(conflict(err)));

export const detail = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}))))
  .populate('users.user')
  .exec()
  .then((project) => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    return reply(project.small);
  })
  .catch(err => reply(badImplementation(err)));

export const deleteProject = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then((project) => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    return Project.remove({ _id: get(request, 'params.id', '') }).exec();
  })
  .then(() => reply('Deleted').code(ACCEPTED))
  .catch(err => reply(badImplementation(err)));

export const getKeys = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}))))
  .exec()
  .then((project) => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    return reply(get(project, 'keys', []));
  })
  .catch(err => reply(badImplementation(err)));

export const addKeys = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then((project) => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    set(project, 'keys', uniq(union(get(project, 'keys', []),
      get(request, 'payload.keys', []))));
    project.markModified('keys');
    return project.save()
    .then(project => reply(project.keys));
  })
  .catch(err => reply(badImplementation(err)));

export const updateKeys = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then((project) => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }

    set(project, 'keys', uniq(union(filter(get(project, 'keys', []), key =>
      isEqual(indexOf(keys(get(request, 'payload.keys', {})), key), -1)),
      values(get(request, 'payload.keys', {})))));

    set(project, 'locales', map(project.locales, locale => {
      set(locale, 'keys', reduce(locale.keys, (total, value, key) => {
        if (!isEqual(indexOf(keys(get(request, 'payload.keys', {})), key), -1)) {
          set(total, get(get(request, 'payload.keys', {}), key, ''), value);
        } else {
          set(total, key, value);
        }
        return total;
      }, {}));
      return locale;
    }));

    project.markModified('keys');
    project.markModified('locales');
    return project.save()
    .then(project => reply(project.keys));
  })
  .catch(err => reply(badImplementation(err)));

export const deleteKeys = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then((project) => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    project.keys = filter(get(project, 'keys', []), key =>
      isEqual(indexOf(get(request, 'payload.keys', []), key), -1));

    project.locales = map(project.locales, locale => {
      locale.keys = omit(locale.keys, get(request, 'payload.keys', []));
      return locale;
    });

    project.markModified('keys');
    project.markModified('locales');
    return project.save()
    .then(project => reply(project.keys).code(ACCEPTED));
  })
  .catch(err => reply(badImplementation(err)));

export const getUsers = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .populate('users.user')
  .exec()
  .then((project) => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    return reply(map(project.users, user =>
      merge(pick(get(user, 'user', {}), ['_id', 'username', 'email']),
        pick(user, ['role']))));
  })
  .catch(err => reply(badImplementation(err)));

export const addUser = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then(project => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    const idx = findIndex(project.users, usr =>
      isEqual(get(usr, 'user', ''), get(request, 'payload.user', '')));

    if (idx > -1) {
      return reply(conflict(new Error('User already in project')));
    }
    project.users.push(get(request, 'payload', {}));
    project.markModified('users');

    return project.save()
    .then(project => reply(map(project.users, user =>
      merge(pick(get(user, 'user', {}), ['_id', 'username', 'email']),
        pick(user, ['role'])))));
  })
  .catch(err => reply(badImplementation(err)));

export const updateUser = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then(project => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    const idx = findIndex(get(project, 'users', []), usr =>
      isEqual(get(usr, 'user', ''), get(request, 'params.userid', '')));

    if (isEqual(idx, -1)) {
      return reply(notFound(new Error('User is not in project')));
    }
    set(project.users[idx], role, get(request, 'params.role', ''));
    project.markModified('users');

    return project.save()
    .then(project => reply(map(project.users, user =>
      merge(pick(get(user, 'user', {}), ['_id', 'username', 'email']),
        pick(user, ['role'])))));
  })
  .catch(err => reply(badImplementation(err)));

export const deleteUser = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then(project => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    const idx = findIndex(project.users, usr =>
      isEqual(get(usr, 'user', ''), get(request, 'payload.user', '')));

    if (isEqual(idx, -1)) {
      return reply(notFound(new Error('User is not in project')));
    }

    project.users.splice(idx, 1);
    project.markModified('users');

    return project.save()
    .then(project => reply(map(project.users, user =>
      merge(pick(get(user, 'user', {}), ['_id', 'username', 'email']),
        pick(user, ['role'])))).code(ACCEPTED));
  })
  .catch(err => reply(badImplementation(err)));

export const getLocales = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}))))
  .exec()
  .then((project) => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    return reply(get(project, 'locales', []));
  })
  .catch(err => reply(badImplementation(err)));

export const addLocale = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then((project) => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    const idx = findIndex(get(project, 'locales', []), locale =>
      isEqual(get(locale, 'code', ''), get(request, 'payload.locale', '')));

    if (idx > -1) {
      return reply(conflict(new Error('Locale already in project')));
    }
    project.locales.push({ code: get(request, 'payload.locale', {}) });
    project.markModified('locales');

    return project.save()
    .then(() => reply(get(project, 'locales', [])));
  })
  .catch(err => reply(badImplementation(err)));

export const updateLocale = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then((project) => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    const idx = findIndex(get(project, 'locales', []), locale =>
      isEqual(get(locale, 'code', ''), get(request, 'params.locale', '')));

    if (isEqual(idx, -1)) {
      return reply(notFound(new Error('Locale is not in project')));
    }

    if (size(filter(keys(get(request, 'payload', {})),
      key => isEqual(indexOf(get(project, 'keys', []), key), -1))) > 0) {
      return reply(forbidden(new Error('Keys are missing in project')));
    }

    forEach(get(request, 'payload', {}), (value, key) =>
      set(get(nth(get(project, 'locales', []), idx), 'keys', {}), key, value));

    project.markModified('locales');

    return project.save()
    .then(() => reply(get(project, 'locales', [])));
  })
  .catch(err => reply(badImplementation(err)));


export const deleteLocale = (request, reply) => reply('ok');
