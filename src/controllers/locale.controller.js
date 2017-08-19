import { ACCEPTED } from 'http-status';
import {
  get, merge, set,
  indexOf, keys, findIndex,
  isNull, isEqual, filter,
  size, nth, forEach
} from 'lodash';
import {
  conflict, notFound, badImplementation, forbidden
} from 'boom';

import Project from '../database/models/project.model';
import { projectsListQuery } from '../helpers';

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
export const deleteLocale = (request, reply) =>
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

    project.locales.splice(idx, 1);
    project.markModified('locales');

    return project.save()
    .then(() => reply(get(project, 'locales', [])).code(ACCEPTED));
  })
  .catch(err => reply(badImplementation(err)));

