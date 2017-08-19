import {
  notFound, badImplementation
} from 'boom';
import {
  merge, get, isNull, findIndex, isEqual, nth, identity
} from 'lodash';

import Project from '../database/models/project.model';
import EXPORTERS from '../exporter';

import { projectsListQuery } from '../helpers';

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
 * This function exports a project's locale, using the
 * provided type and locale code
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const exporter = (request, reply) =>
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
      get(request, 'params.type', ''), get(project, 'keys', [])));
  })
  .catch(err => reply(badImplementation(err)));

