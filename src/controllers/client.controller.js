import mongoose from 'mongoose';
import {
  ACCEPTED, CREATED
} from 'http-status';
import {
  conflict, notFound, badImplementation
} from 'boom';
import {
  get, set, has,
  merge, isNull, map, assign
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
  .then(clients => reply(map(clients,
    ({ _id, token }) => assign({ id: _id, token }))))
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
  .then(({ _id, token }) => reply(assign({ id: _id, token })).code(CREATED))
  .catch(err => reply(conflict(err)));

/**
 * This function serves details about a client
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const detailClient = (request, reply) =>
  Client
  .findOne(merge(clientsListQuery(get(request, 'auth.credentials', {})),
    { _id: new mongoose.Types.ObjectId(get(request, 'params.id', '')) }))
  .exec()
  .then((client) => {
    if (isNull(client)) {
      return reply(notFound(new Error('Client not found')));
    }
    return reply(assign({
      id: get(client, '_id', ''),
      projects: get(client, 'projects', []),
      token: get(client, 'token', '')
    }));
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
    if (get(request, 'payload.token', false)) {
      set(client, 'token', null);
      client.markModified('token');
    }
    if (has(get(request, 'payload', {}), 'name')) {
      set(client, 'name', get(request, 'payload.name', ''));
      client.markModified('name');
    }
    return client.save()
      .then(({ _id, token }) => reply(assign({
        id: _id,
        token
      })));
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

