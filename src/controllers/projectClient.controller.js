import { ACCEPTED } from 'http-status';
import {
  conflict, notFound, badImplementation
} from 'boom';
import {
  get, merge, map,
  findIndex, assign,
  isNull, isEqual, isEmpty
} from 'lodash';

import Project from '../database/models/project.model';
import Client from '../database/models/client.model';
import { clientsListQuery, clientQuery, projectsListQuery } from '../helpers';

/**
 * This function lists the project's clients
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const getClients = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then(project => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    return Client
    .find(clientsListQuery(get(request, 'auth.credentials', {}),
      get(request, 'params.id', '')))
    .exec()
    .then((clients) => {
      if (isEmpty(clients)) {
        return reply(notFound(new Error('Clients not found')));
      }
      return reply(map(clients, ({ _id, token }) =>
        assign({
          id: _id,
          token
        })));
      });
  })
.catch(err => reply(badImplementation(err)));

/**
 * This function add a new client to the project
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const addClient = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then(proj => {
    if (isNull(proj)) {
      return reply(notFound(new Error('Project not found')));
    }
    return Client
    .findOne(clientQuery(get(request, 'payload.client', ''), get(request, 'auth.credentials', {})))
    .exec()
    .then((client) => {
      if (isNull(client)) {
        return reply(notFound(new Error('Client does not exists')));
      }

      const idx = findIndex(get(client, 'projects', []), project =>
        isEqual(project.toString(), get(request, 'params.id', '')));

      if (!isEqual(idx, -1)) {
        return reply(conflict(new Error('Client already registered project')));
      }

      client.projects.push(get(request, 'params.id', ''));
      client.markModified('projects');
      return client.save()
      .then(({ _id, token }) => reply(assign({
        id: _id,
        token
      })));
    });
  })
  .catch(err => reply(badImplementation(err)));

/**
 * This function removes a client from a project
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const deleteClient = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then(proj => {
    if (isNull(proj)) {
      return reply(notFound(new Error('Project not found')));
    }
    return Client
    .findOne(clientQuery(get(request, 'params.client', ''), get(request, 'auth.credentials', {})))
    .exec()
    .then((client) => {
      if (isNull(client)) {
        return reply(notFound(new Error('Client does not exists')));
      }

      const idx = findIndex(get(client, 'projects', []), project =>
        isEqual(project.toString(), get(request, 'params.id', '')));

      if (isEqual(idx, -1)) {
        return reply(notFound(new Error('Client does not follow project')));
      }

      client.projects.splice(idx, 1);
      client.markModified('projects');
      return client.save()
      .then(() => reply('Deleted').code(ACCEPTED));
    });
  })
  .catch(err => reply(badImplementation(err)));
