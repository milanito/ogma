import jwt from 'jsonwebtoken';
import {
  notFound, badImplementation, forbidden
} from 'boom';
import {
  get, isNull
} from 'lodash';

import User from '../database/models/user.model';
import { api } from '../config';

export const authenticate = (request, reply) =>
  User.findOne({
    email: get(request, 'payload.email', '')
  })
  .exec()
  .then((user) => {
    if (isNull(user)) {
      return reply(notFound(new Error('User not found')));
    }
    return user;
  })
  .then(user =>
    user
    .comparePassword(get(request, 'payload.password', ''))
    .then((res) => {
      if (!res) {
        return reply(forbidden(new Error('Password is wrong')));
      }
      return reply({
        token: jwt.sign(user.profile, get(api, 'secret', ''))
      });
    }))
  .catch(err => badImplementation(err));
