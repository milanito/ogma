import request from 'supertest';
import { expect } from 'chai';
import {
  BAD_REQUEST, OK, NOT_FOUND, FORBIDDEN
} from 'http-status';
import {
  forEach, get, pick, merge, clone, omit
} from 'lodash';

import User from '../src/database/models/user.model';
import { userAdmin, userTest, createUsers, HOST } from './seed';

describe('# Auth Tests', () => {
  before(() => createUsers());

  after(() => User.remove({}).exec());

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
});
