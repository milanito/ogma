import {
  ACCEPTED, CREATED
} from 'http-status';
import {
  conflict, notFound, badImplementation
} from 'boom';
import {
  get, set,
  merge, isNull, map
} from 'lodash';

import Client from '../database/models/client.model';
import { clientsListQuery } from '../helpers';

/**
 * This function lists the clients
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const listClients = (request, reply) =>
  Client.find(clientsListQuery(get(request, 'auth.credentials', {})))
  .exec()
  .then(users => reply(map(users, user => user.profile)))
  .catch(err => reply(badImplementation(err)));

/**
 * This function creates a new client
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const createClient = (request, reply) =>
  Client
  .create(merge(get(request, 'payload', {}), {
    owner: get(request, 'auth.credentials._id', '')
  }))
  .then(client => reply(client).code(CREATED))
  .catch(err => reply(conflict(err)));

/**
 * This function serves details about a client
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const detailClient = (request, reply) =>
  Client
  .findOne(clientsListQuery(get(request, 'auth.credentials', {}),
    get(request, 'params.id', '')))
  .exec()
  .then((client) => {
    if (isNull(client)) {
      return reply(notFound(new Error('Client not found')));
    }
    return reply(client);
  })
  .catch(err => reply(badImplementation(err)));

/**
 * This function update a given client
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const updateClient = (request, reply) =>
  Client
  .findOne(clientsListQuery(get(request, 'auth.credentials', {}),
    get(request, 'params.id', '')))
  .exec()
  .then((client) => {
    if (isNull(client)) {
      return reply(notFound(new Error('Client not found')));
    }
    set(client, 'token', null);
    client.markModified('token');
    return client.save()
      .then(client => reply(client));
  })
  .catch(err => reply(badImplementation(err)));

/**
 * This function deletes a given client
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const deleteClient = (request, reply) =>
  Client
  .findOne(clientsListQuery(get(request, 'auth.credentials', {}),
    get(request, 'params.id', '')))
  .exec()
  .then((client) => {
    if (isNull(client)) {
      return reply(notFound(new Error('Client not found')));
    }

    return Client
      .remove({ _id: get(request, 'params.id', '') }).exec()
      .then(() => reply('deleted').code(ACCEPTED));
  })
  .catch(err => reply(badImplementation(err)));

