import request from 'supertest';
import { expect } from 'chai';
import {
  BAD_REQUEST, OK, NOT_FOUND, FORBIDDEN
} from 'http-status';
import {
  forEach, get, pick, merge, clone
} from 'lodash';

import User from '../src/database/models/user.model';
import { userAdmin, userTest, createUsers, HOST } from './seed';

describe('# Auth Tests', () => {
  before(() => createUsers());

  after(() => User.remove({}).exec());

  describe('## Authentication : POST /api/auth', () => {
    describe('## Error cases', () => {
      forEach(['email', 'password'], field =>
        it(`should return a bad request when only ${field} field`, () =>
          request(HOST)
          .post('/api/auth')
          .send(pick(userAdmin, [field]))
          .expect(BAD_REQUEST)));

      it('should not accept a wrong email', () =>
        request(HOST)
        .post('/api/auth')
        .send(pick(merge(clone(userTest), { email: 'bademail' }), ['email', 'password']))
        .expect(BAD_REQUEST));

      it('should return 404 for a unexisting email', () =>
        request(HOST)
        .post('/api/auth')
        .send(pick(merge(clone(userTest), { email: 'bad@email.com' }), ['email', 'password']))
        .expect(NOT_FOUND));

      it('should return forbidden for a wrong password', () =>
        request(HOST)
        .post('/api/auth')
        .send(pick(merge(clone(userTest), { password: 'badpass' }), ['email', 'password']))
        .expect(FORBIDDEN));
    });

    describe('## Success cases', () => {
      forEach([{
        name: 'admin',
        user: userAdmin
      }, {
        name: 'normal',
        user: userTest
      }], ({ name, user }) =>
        it(`should login an ${name} user`, () =>
          request(HOST)
          .post('/api/auth')
          .send(pick(user, ['email', 'password']))
          .expect('Content-Type', /json/)
          .expect(OK)
          .then(({ body }) => expect(body).to.have.property('token'))));
    });
  });
});
