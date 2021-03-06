import request from 'supertest';
import mongoose from 'mongoose';
import { expect } from 'chai';
import {
  BAD_REQUEST, UNAUTHORIZED, CONFLICT, CREATED,
  NOT_FOUND, OK, FORBIDDEN, ACCEPTED
} from 'http-status';
import {
  forEach, omit, get, merge, clone
} from 'lodash';

import User from '../src/database/models/user.model';
import { userTest, userCreate, HOST, createUsers } from './seed';

describe('# User Tests', () => {
  let tokenUser;
  let tokenAdmin;
  let adminUser;
  let normalUser;

  before(() =>
    createUsers()
  .then(([admin, normal]) => {
    adminUser = get(admin, 'user', {});
    tokenAdmin = get(admin, 'token', '');
    normalUser = get(normal, 'user', {});
    tokenUser = get(normal, 'token', '');
    return true;
  }));

  after(() => User.remove({}).exec());

  describe('## User Listing : GET /api/users', () => {
    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .get('/api/users')
        .expect(UNAUTHORIZED));

      it('should fail user when no admin', () =>
        request(HOST)
        .get('/api/users')
        .set('Authorization', `Bearer ${tokenUser}`)
        .expect(UNAUTHORIZED));
    });

    describe('## Success cases', () => {
      it('should fail user when no admin', () =>
        request(HOST)
        .get('/api/users')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(OK)
        .then(({ body }) =>
          expect(body).to.be.an('array').that.is.not.empty));
    });
  });

  describe('## User creation : POST /api/users', () => {
    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .post('/api/users')
        .send(userCreate)
        .expect(UNAUTHORIZED));

      forEach(['email', 'password', 'username'], param =>
        it(`should return a 400 for a missing ${param}`, () =>
          request(HOST)
          .post('/api/users')
          .send(omit(clone(userCreate), [param]))
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .expect(BAD_REQUEST)));

      it('should not accept a wrong email', () =>
        request(HOST)
        .post('/api/users')
        .send(merge(clone(userTest), { email: 'bademail' }))
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(BAD_REQUEST));

      it('should not create a duplicate user', () =>
        request(HOST)
        .post('/api/users')
        .send(userTest)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(CONFLICT));

      it('should not create a user when no admin', () =>
        request(HOST)
        .post('/api/users')
        .send(userCreate)
        .set('Authorization', `Bearer ${tokenUser}`)
        .expect(UNAUTHORIZED));
    });

    describe('## Success cases', () => {
      it('should create a user', () =>
        request(HOST)
        .post('/api/users')
        .send(userCreate)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(CREATED));
    });
  });

  describe('## User detail : GET /api/users/{id}', () => {
    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .get(`/api/users/${normalUser._id}`)
        .expect(UNAUTHORIZED));

      it('should not accept a wrong id', () =>
        request(HOST)
        .get(`/api/users/toto`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(BAD_REQUEST));

      it('should return 404 on not found user', () =>
        request(HOST)
        .get(`/api/users/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(NOT_FOUND));

      it('should not fetch another user as normal user', () =>
        request(HOST)
        .get(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .expect(UNAUTHORIZED));
    });

    describe('## Success cases', () => {
      it('should fetch any user as an admin', () =>
        request(HOST)
        .get(`/api/users/${normalUser._id}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(OK));

      it('should fetch itself as a normal user', () =>
        request(HOST)
        .get(`/api/users/${normalUser._id}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .expect(OK));
    });
  });

  describe('## User Update : PATCH /api/users/{id}', () => {
    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .patch(`/api/users/${normalUser._id}`)
        .send({ email: 'test@new.com', password: 'qfsfsdf' })
        .expect(UNAUTHORIZED));

      it('should not accept a wrong id', () =>
        request(HOST)
        .get(`/api/users/toto`)
        .send({ email: 'test@new.com', password: 'qfsfsdf' })
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(BAD_REQUEST));

      it('should not accept a wrong email', () =>
        request(HOST)
        .patch(`/api/users/${normalUser._id}`)
        .send({ email: 'test', password: 'qfsfsdf' })
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(BAD_REQUEST));

      it('should return 404 on not found user', () =>
        request(HOST)
        .patch(`/api/users/${new mongoose.Types.ObjectId()}`)
        .send({ email: 'test@new.com', password: 'qfsfsdf' })
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(NOT_FOUND));

      it('should not update another user as normal user', () =>
        request(HOST)
        .get(`/api/users/${adminUser._id}`)
        .send({ email: 'test@new.com', password: 'qfsfsdf' })
        .set('Authorization', `Bearer ${tokenUser}`)
        .expect(UNAUTHORIZED));
    });

    describe('## Success cases', () => {
      it('should update any user as an admin', () =>
        request(HOST)
        .patch(`/api/users/${normalUser._id}`)
        .send({ email: 'test@new.com', password: 'qfsfsdf' })
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(OK));

      it('should update itself as a normal user', () =>
        request(HOST)
        .patch(`/api/users/${normalUser._id}`)
        .send({ email: 'test@new2.com', password: 'qfsfsdf' })
        .set('Authorization', `Bearer ${tokenUser}`)
        .expect(OK));
    });
  });

  describe('## User Delete : DELETE /api/users/{id}', () => {
    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .delete(`/api/users/${normalUser._id}`)
        .expect(UNAUTHORIZED));

      it('should not accept a wrong id', () =>
        request(HOST)
        .delete(`/api/users/toto`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(BAD_REQUEST));

      it('should return 404 on not found user', () =>
        request(HOST)
        .delete(`/api/users/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(NOT_FOUND));

      it('should not delete another user as normal user', () =>
        request(HOST)
        .delete(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .expect(UNAUTHORIZED));

      it('should not delete oneself', () =>
        request(HOST)
        .delete(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(FORBIDDEN));
    });

    describe('## Success cases', () => {
      it('should delete any user as an admin', () =>
        request(HOST)
        .delete(`/api/users/${normalUser._id}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(ACCEPTED));
    });
  });
});
