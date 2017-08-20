import Promise from 'bluebird';
import mongoose from 'mongoose';
import request from 'supertest';
import { expect } from 'chai';
import {
  BAD_REQUEST, OK, NOT_FOUND, FORBIDDEN
} from 'http-status';
import {
  forEach, get, pick, merge, clone, omit
} from 'lodash';

import User from '../src/database/models/user.model';
import Client from '../src/database/models/client.model';
import { userAdmin, userTest, createUsers, createClient, HOST } from './seed';

describe('# Auth Tests', () => {
  before(() => createUsers()
  .then(([{ user }]) =>
    createClient(user)));

  after(() => User.remove({}).exec()
    .then(() => Client.remove({}).exec()));

  describe('## Authentication User : POST /api/auth', () =>
    forEach([{
      name: 'admin',
      user: merge(clone(userAdmin), { grant: 'user' })
    }, {
      name: 'normal',
      user: merge(clone(userTest), { grant: 'user' })
    }], ({ name, user }) => {
      describe(`## Error cases for ${name}`, () => {
        forEach(['email', 'password', 'grant'], field =>
          it(`should return a bad request when only ${field} field`, () =>
            request(HOST)
            .post('/api/auth')
            .send(pick(user, [field]))
            .expect(BAD_REQUEST)));

        forEach(['email', 'password', 'grant'], field =>
          it(`should return a bad request when no ${field} field`, () =>
            request(HOST)
            .post('/api/auth')
            .send(omit(pick(user, ['email', 'password', 'grant']), [field]))
            .expect(BAD_REQUEST)));

        it('should not accept a wrong email', () =>
          request(HOST)
          .post('/api/auth')
          .send(pick(merge(clone(user), { email: 'bademail' }), ['email', 'password', 'grant']))
          .expect(BAD_REQUEST));

        it('should return 404 for a unexisting email', () =>
          request(HOST)
          .post('/api/auth')
          .send(pick(merge(clone(user), { email: 'bad@email.com' }), ['email', 'password', 'grant']))
          .expect(NOT_FOUND));

        it('should return forbidden for a wrong password', () =>
          request(HOST)
          .post('/api/auth')
          .send(pick(merge(clone(user), { password: 'badpass' }), ['email', 'password', 'grant']))
          .expect(FORBIDDEN));
      });

      describe(`## Success cases for ${name}`, () =>
        it(`should login an ${name} user`, () =>
          request(HOST)
          .post('/api/auth')
          .send(pick(user, ['email', 'password', 'grant']))
          .expect('Content-Type', /json/)
          .expect(OK)
          .then(({ body }) => expect(body).to.have.property('token'))));
    }));

  describe('## Authentication Client : POST /api/auth', () => {
    let client;

    beforeEach(() =>
      Client.findOne({})
      .then((clnt) => {
        client = pick(merge(clnt, { grant: 'client', id: get(clnt, '_id', '') }),
          ['id', 'grant', 'token']);
        return true;
      }));

      describe('## Error cases for client', () => {
        forEach(['id', 'token', 'grant'], field =>
          it(`should return a bad request when only ${field} field`, () =>
            request(HOST)
            .post('/api/auth')
            .send(pick(client, [field]))
            .expect(BAD_REQUEST)));

        forEach(['id', 'token', 'grant'], field =>
          it(`should return a bad request when no ${field} field`, () =>
            request(HOST)
            .post('/api/auth')
            .send(omit(pick(client, ['id', 'token', 'grant']), [field]))
            .expect(BAD_REQUEST)));

        it('should not accept a wrong id', () =>
          request(HOST)
          .post('/api/auth')
          .send(pick(merge(client, { id: 'badid' }), ['id', 'token', 'grant']))
          .expect(BAD_REQUEST));

        it('should return 404 for a unexisting id', () =>
          request(HOST)
          .post('/api/auth')
          .send(pick(merge(client,
            { id: new mongoose.Types.ObjectId() }), ['id', 'token', 'grant']))
          .expect(NOT_FOUND));

        it('should return forbidden for a wrong token', () =>
          request(HOST)
          .post('/api/auth')
          .send(pick(merge(client, { token: 'badtoken' }), ['id', 'token', 'grant']))
          .expect(FORBIDDEN));
      });

      describe('## Success cases for client', () =>
        it('should login a client', () =>
          request(HOST)
          .post('/api/auth')
          .send(pick(client, ['id', 'token', 'grant']))
          .expect('Content-Type', /json/)
          .expect(OK)
          .then(({ body }) => expect(body).to.have.property('token'))));
  });
});
