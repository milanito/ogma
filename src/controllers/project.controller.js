import { ACCEPTED, CREATED } from 'http-status';
import {
  conflict, notFound, badImplementation, forbidden
} from 'boom';
import {
  get, omit, clone, merge, map, set, union,
  indexOf, keys, pick, findIndex,
  isNull, isEqual, reduce, values, uniq, filter,
  size, nth, forEach
} from 'lodash';

import Project from '../database/models/project.model';
import { projectsListQuery } from '../helpers';

/**
 * This function lists the projects :
 * - If admin, it lists all the projects
 * - If user, it lists the user's projects
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const list = (request, reply) =>
  Project
  .find(projectsListQuery(get(request, 'auth.credentials', {})))
  .exec()
  .then(projects =>
    reply(map(projects, project => project.small)))
  .catch(err => reply(badImplementation(err)));

/**
 * This function creates a new project, assigning the
 * user creating it to ownership
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
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

/**
 * This function returns the project's details
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
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

/**
 * This function is used to delete a project
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
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

/**
 * This function retrieves the project's keys
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
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

/**
 * This function add new keys to the project
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
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

/**
 * This function updates the given project's keys
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
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

/**
 * This function deletes the given project's keys
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
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

/**
 * This function lists the project's user
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
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

/**
 * This function add a new user to the project
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
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
    const idx = findIndex(get(project, 'users', []), usr =>
      isEqual(get(usr, 'user', '').toString(), get(request, 'payload.user', '')));

    if (idx > -1) {
      return reply(conflict(new Error('User already in project')));
    }
    project.users.push(get(request, 'payload', {}));
    project.markModified('users');

    return project.save()
    .then(project => reply(map(get(project, 'users', []), user =>
      pick(user, ['role', 'user']))));
  })
  .catch(err => reply(badImplementation(err)));

/**
 * This function update a user role to a project
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
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
      isEqual(get(usr, 'user', '').toString(), get(request, 'payload.user', '')));

    if (isEqual(idx, -1)) {
      return reply(notFound(new Error('User is not in project')));
    }
    set(project.users[idx], 'role', get(request, 'payload.role', ''));
    project.markModified('users');

    return project.save()
    .then(project => reply(map(project.users, user =>
      pick(user, ['role', 'user']))));
  })
  .catch(err => reply(badImplementation(err)));

/**
 * This function removes a user from a project
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
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
      isEqual(get(usr, 'user', '').toString(), get(request, 'payload.user', '')));

    if (isEqual(idx, -1)) {
      return reply(notFound(new Error('User is not in project')));
    }

    project.users.splice(idx, 1);
    project.markModified('users');

    return project.save()
    .then(project => reply(map(project.users, user =>
      pick(user, ['role', 'user']))).code(ACCEPTED));
  })
  .catch(err => reply(badImplementation(err)));

/**
 * This function lists all the project's locales
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
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

/**
 * This function add a new locale to the project
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
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

/**
 * This function add key's translation to the given locale
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
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


/**
 * This function removes the given locale from the project
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const deleteLocale = (request, reply) => reply('ok');
