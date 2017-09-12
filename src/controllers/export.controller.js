import Promise from 'bluebird';
import {
  notFound, badImplementation
} from 'boom';
import {
  merge, get, isNull, findIndex, isEqual, nth, identity,
  reduce, isEmpty, map, uniq, union, keys
} from 'lodash';

import Client from '../database/models/client.model';
import Project from '../database/models/project.model';
import EXPORTERS, { getContentType } from '../exporter';

import { projectsListQueryWithClient, projectsListQuery } from '../helpers';

/**
 * This function is a wrapper that selects the right
 * exporter or identity function if none is found
 * @param { Object } locale the locale
 * @param { String } locale.code the locale's code
 * @param { Array } locale.keys the locale's keys
 * @param { String } type the type of export
 * @param { Array } pKeys the project's keys
 * @return { Object | String } The exported data
 */
const _exportLocale = ({ code, keys }, type, pKeys) =>
  get(EXPORTERS, type, identity)(keys, pKeys, code);

/**
 * This function exports the accepted export type
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const listExporters = (request, reply) =>
  reply(keys(EXPORTERS));

/**
 * This function exports a project's locale, using the
 * provided type and locale code
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const exporterProject = (request, reply) =>
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

    return reply(_exportLocale(nth(get(project, 'locales', []), idx),
      get(request, 'params.type', ''), get(project, 'keys', [])))
      .type(getContentType(get(request, 'params.type', '')));
  })
  .catch(err => reply(badImplementation(err)));

/**
 * This function exports some projects' locale, using the
 * provided type and locale code
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const exporterProjects = (request, reply) =>
  Promise.all(map(get(request, 'payload.projects', []), _id =>
    Project
    .findOne(projectsListQueryWithClient(get(request,
      'auth.credentials', {}), _id))
    .exec()))
  .then((projects) => {
    if (isEmpty(projects)) {
      return reply(notFound(new Error('Projects not found')));
    }
    const ind = findIndex(projects, project => isNull(project));
    if (!isEqual(ind, -1)) {
      return reply(notFound(new Error(`Project #${nth(get(request, 'payload.projects', []), ind)} does not exists`)));
    }

    const idxs = map(projects, (project) =>
      findIndex(get(project, 'locales', []), locale =>
        isEqual(get(locale, 'code', ''), get(request, 'params.locale', ''))));

    if (!isEqual(findIndex(idxs, idx => isEqual(idx, -1)), -1)) {
      return reply(notFound(new Error('Locale is not in project')));
    }

    return reply(_exportLocale(reduce(projects,
      (total, project, idx) => merge(total, {
        keys: get(nth(get(project, 'locales', []), nth(idxs, idx)), 'keys', {})
      }), {
        code: get(request, 'params.locale', '')
      }), get(request, 'params.type', ''),
      reduce(projects,
        (total, project) => uniq(union(total, get(project, 'keys', []))), [])))
      .type(getContentType(get(request, 'params.type', '')));
  })
  .catch(err => reply(badImplementation(err)));


/**
 * This function exports some projects' locale, using the
 * provided type and locale code
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const exporterClientProjects = (request, reply) =>
  Client
  .findById(get(request, 'auth.credentials._id', ''))
  .exec()
  .then((client) => {
    if (isNull(client)) {
      return reply(notFound(new Error('Client does not exists')));
    }

    if (isEmpty(get(client, 'projects', []))) {
      return reply(notFound(new Error('Client does not have any project')));
    }

    return Promise
      .all(map(get(client, 'projects', []), id =>
        Project.findById(id).exec()))
      .then((projects) => {
        if (isEmpty(projects)) {
          return reply(notFound(new Error('Projects not found')));
        }
        const ind = findIndex(projects, project => isNull(project));
        if (!isEqual(ind, -1)) {
          return reply(notFound(new Error(`Project #${ind} does not exists`)));
        }

        const idxs = map(projects, (project) =>
          findIndex(get(project, 'locales', []), locale =>
            isEqual(get(locale, 'code', ''), get(request, 'params.locale', ''))));

        if (!isEqual(findIndex(idxs, idx => isEqual(idx, -1)), -1)) {
          return reply(notFound(new Error('Locale is not in project')));
        }

        return reply(_exportLocale(reduce(projects,
          (total, project, idx) => merge(total, {
            keys: get(nth(get(project, 'locales', []), nth(idxs, idx)), 'keys', {})
          }), {
            code: get(request, 'params.locale', '')
          }), get(request, 'params.type', ''),
          reduce(projects,
            (total, project) => uniq(union(total, get(project, 'keys', []))), [])))
          .type(getContentType(get(request, 'params.type', '')));
      });
  })
  .catch(err => reply(badImplementation(err)));
