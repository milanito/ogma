import {
  conflict, notFound, badImplementation
} from 'boom';
import {
  get, omit, clone,
  merge, isNull, map
} from 'lodash';

import User from '../database/models/user.model';

export const list = (request, reply) =>
  User.find()
  .exec()
  .then(users => reply(map(users, user => user.profile)))
  .catch(err => reply(badImplementation(err)));

export const register = (request, reply) =>
  User
  .create(get(request, 'payload', {}))
  .then(user => reply(user.profile).code(201))
  .catch(err => reply(conflict(err)));

export const detail = (request, reply) =>
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

export const update = (request, reply) =>
  User
  .findById(get(request, 'params.id', ''))
  .exec()
  .then((user) => {
    if (isNull(user)) {
      return reply(notFound(new Error('User not found')));
    }
    return merge(clone(user),
      omit(get(request, 'payload', {}), ['_id', 'hash', 'password']))
    .save();
  })
  .then(user => reply(user.profile))
  .catch(err => reply(badImplementation(err)));
