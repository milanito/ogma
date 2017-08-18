import {
  notFound, badImplementation, notSupported
} from 'boom';
import {
  merge, get, isNull, findIndex, isEqual, nth, identity
} from 'lodash';

import Project from '../database/models/project.model';
import EXPORTERS from '../exporter';

import { projectsListQuery } from '../helpers';

const _exportLocale = ({ code, keys }, type, pKeys) =>
  get(EXPORTERS, type, identity)(keys, pKeys, code);

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

