import jwt from 'jsonwebtoken';
import Promise from 'bluebird';
import {
  map, assign, get
} from 'lodash';

import User from '../src/database/models/user.model';
import { api } from '../src/config';

export const HOST = 'http://localhost:3000';

export const userAdmin = {
  email: 'admin@admin.com',
  username: 'admin',
  role: 'admin',
  password: 'admin'
};

export const userTest = {
  email: 'user@user.com',
  username: 'user',
  role: 'user',
  password: 'user'
};

export const userCreate = {
  email: 'test@test.com',
  username: 'test',
  role: 'user',
  password: 'test'
};

export const createUsers = () =>
  User.remove({}).exec()
  .then(() =>
    Promise.all(map([
      userAdmin, userTest
    ], usr =>
      User.create(usr)
      .then((user) => assign({
        user,
        token: jwt.sign(user.profile, get(api, 'secret', ''))
      })))));
