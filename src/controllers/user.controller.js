import {
  ACCEPTED
} from 'http-status';
import {
  conflict, notFound, badImplementation, forbidden
} from 'boom';
import {
  get, clone, pick,
  merge, isNull, map, isEqual
} from 'lodash';

import User from '../database/models/user.model';

/**
 * This function lists the users
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const listUsers = (request, reply) =>
  User.find()
  .exec()
  .then(users => reply(map(users, user => user.profile)))
  .catch(err => reply(badImplementation(err)));

/**
 * This function creates a new user
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const createUser = (request, reply) =>
  User
  .create(get(request, 'payload', {}))
  .then(user => reply(user.profile).code(201))
  .catch(err => reply(conflict(err)));

/**
 * This function serves details about the logged user
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const detailMe = (request, reply) =>
  User
  .findById(get(request, 'auth.credentials._id', ''))
  .exec()
  .then((user) => {
    if (isNull(user)) {
      return reply(notFound(new Error('User not found')));
    }
    return reply(user.profile);
  })
  .catch(err => reply(badImplementation(err)));

/**
 * This function serves details about a user
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const detailUser = (request, reply) =>
  User
  .findById(get(request, 'params.id', ''))
  .exec()
  .then((user) => {
    if (isNull(user)) {
      return reply(notFound(new Error('User not found')));
    }
    return reply(user.profile);
  })
  .catch(err => reply(badImplementation(err)));

/**
 * This function update a given user
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const updateUser = (request, reply) =>
  User
  .findById(get(request, 'params.id', ''))
  .exec()
  .then((user) => {
    if (isNull(user)) {
      return reply(notFound(new Error('User not found')));
    }
    return merge(clone(user),
      pick(get(request, 'payload', {}), ['email', 'password', 'role']))
      .save()
      .then(user => reply(user.profile));
  })
  .catch(err => reply(badImplementation(err)));

/**
 * This function deletes a given user
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const deleteUser = (request, reply) =>
  User
  .findById(get(request, 'params.id', ''))
  .exec()
  .then((user) => {
    if (isNull(user)) {
      return reply(notFound(new Error('User not found')));
    }

    if (isEqual(get(user, '_id', '').toString(),
      get(request, 'auth.credentials._id', ''))) {
      return reply(forbidden(new Error('Cannot delete oneself')));
    }
    return User
      .remove({ _id: get(request, 'params.id', '') }).exec()
      .then(() => reply('deleted').code(ACCEPTED));
  })
  .catch(err => reply(badImplementation(err)));
