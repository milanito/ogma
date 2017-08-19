import { ACCEPTED } from 'http-status';
import {
  notFound, badImplementation
} from 'boom';
import {
  get, omit, merge, map, set, union,
  indexOf, keys,
  isNull, isEqual, reduce, values, uniq, filter,
} from 'lodash';

import Project from '../database/models/project.model';
import { projectsListQuery } from '../helpers';

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
