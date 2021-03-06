import jwt from 'jsonwebtoken';
import {
  notFound, badImplementation, forbidden
} from 'boom';
import {
  get, isNull, merge, pick
} from 'lodash';

import Client from '../database/models/client.model';
import User from '../database/models/user.model';
import Errors from '../config/errors';
import { api } from '../config';

/**
 * This function authenticates a user, replying
 * not found if the user is not found or forbidden
 * if the password is wrong
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
const _authenticateUser = (request, reply) =>
  User.findOne({
    email: get(request, 'payload.email', '')
  })
  .exec()
  .then((user) => {
    if (isNull(user)) {
      return reply(notFound(new Error(Errors.userNotFound)));
    }
    return user
    .comparePassword(get(request, 'payload.password', ''))
    .then((res) => {
      if (!res) {
        return reply(forbidden(new Error(Errors.wrongPassword)));
      }
      return reply({
        token: jwt.sign(user.profile, get(api, 'secret', ''))
      });
    });
  })
  .catch(err => badImplementation(err));

/**
 * This function authenticates a client, replying
 * not found if the client is not found or forbidden
 * if the token is wrong
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
const _authenticateClient = (request, reply) =>
  Client
  .findById(get(request, 'payload.id', ''))
  .exec()
  .then((client) => {
    if (isNull(client)) {
      return reply(notFound(new Error(Errors.clientNotFound)));
    }
    return client
    .compareToken(get(request, 'payload.token', ''))
    .then((res) => {
      if (!res) {
        return reply(forbidden(new Error(Errors.wrongToken)));
      }
      return reply({
        token: jwt.sign(merge(pick(client, ['_id']), { role: 'client' }),
          get(api, 'secret', ''))
      });
    });
  })
  .catch(err => badImplementation(err));

/**
 * Dictionnary for the authentication functions
 */
const AUTHENTICATORS = {
  user: _authenticateUser,
  client: _authenticateClient
};

/**
 * This function is a wrapper, choosing the right function
 * to authenticate to the API, depending on the grant type
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const authenticate = (request, reply) =>
  get(AUTHENTICATORS,
    get(request, 'payload.grant', ''),
    () => reply(forbidden(new Error(Errors.grantNotAuthorized))))(request, reply);
