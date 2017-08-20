import jwt from 'jsonwebtoken';
import Promise from 'bluebird';
import {
  map, assign, get, merge, pick
} from 'lodash';

import Project from '../src/database/models/project.model';
import User from '../src/database/models/user.model';
import Client from '../src/database/models/client.model';
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

export const fullProject = {
  name: 'test project',
  keys: ['test.key'],
  locales: [{
    code: 'fr_FR',
    keys: {
      test: { key: 'translation' }
    }
  }],
  users: []
};

export const clientTest = {
  name: 'test client'
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

export const createFullProject = ({ _id }) =>
  Project.remove({}).exec()
  .then(() =>
    Project
    .create(merge(fullProject, {
      users: [{ user: _id , role: 'owner'}]
    })));

export const createClient = ({ _id }) =>
  Client.remove({}).exec()
  .then(() =>
    Client.create(merge(clientTest, { owner: _id })))
    .then(client => assign({
      client,
      token: jwt.sign(merge(pick(client, ['_id']), { role: 'client' }), get(api, 'secret', ''))
    }));
