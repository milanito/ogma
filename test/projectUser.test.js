import request from 'supertest';
import mongoose from 'mongoose';
import { expect } from 'chai';
import {
  BAD_REQUEST, UNAUTHORIZED, CONFLICT, CREATED,
  NOT_FOUND, OK, ACCEPTED
} from 'http-status';
import {
  forEach, omit, get, merge, clone, keys, pick
} from 'lodash';

import User from '../src/database/models/user.model';
import Client from '../src/database/models/client.model';
import Project from '../src/database/models/project.model';
import exporters from '../src/exporter';
import {
  userTest, userCreate, HOST, createUsers,
  createFullProject, fullProject, createClient
} from './seed';

describe('# Project User Tests', () => {
  let tokenUser;
  let tokenAdmin;
  let adminUser;
  let normalUser;
  let project;
  const locale = 'fr_FR';

  before(() =>
    createUsers()
    .then(([admin, normal]) => {
      adminUser = get(admin, 'user', {});
      tokenAdmin = get(admin, 'token', '');
      normalUser = get(normal, 'user', {});
      tokenUser = get(normal, 'token', '');
      return true;
    })
    .then(() =>
      createFullProject(adminUser))
    .then((prjct) => {
      project = prjct;
      return true;
    }));

  after(() =>
    User.remove({}).exec()
    .then(() => Project.remove({}).exec()));

  describe('## Project Users List : GET /api/projects/{id}/users', () => {
    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .get(`/api/projects/${get(project, '_id', '')}/users`)
        .expect(UNAUTHORIZED));

      it('should fail for a wrong id', () =>
        request(HOST)
        .get('/api/projects/toto/users')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(BAD_REQUEST));

      it('should fail for an unexisting project', () =>
        request(HOST)
        .get(`/api/projects/${new mongoose.Types.ObjectId()}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(NOT_FOUND));
    });

    describe('## Success cases', () => {
      it('should return a 200 for an authorized user', () =>
        request(HOST)
        .get(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(OK));
    });
  });

  describe('## Project User register : POST /api/projects/{id}/users', () => {
    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/users`)
        .send({ user: get(normalUser, '_id', ''), role: 'normal' })
        .expect(UNAUTHORIZED));

      it('should fail without an empty object', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ })
        .expect(BAD_REQUEST));

      it('should fail without a user', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ role: 'normal' })
        .expect(BAD_REQUEST));

      it('should fail without a role', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: get(normalUser, '_id', '') })
        .expect(BAD_REQUEST));

      it('should fail with a wrong user', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: 'toto', role: 'normal' })
        .expect(BAD_REQUEST));

      it('should fail with a wrong role', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: get(normalUser, '_id', ''), role: 'toto' })
        .expect(BAD_REQUEST));

      it('should fail for an unexisting project', () =>
        request(HOST)
        .post(`/api/projects/${new mongoose.Types.ObjectId()}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: get(normalUser, '_id', ''), role: 'normal' })
        .expect(NOT_FOUND));

      it('should fail for an already registered user', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: get(adminUser, '_id', ''), role: 'normal' })
        .expect(CONFLICT));
    });

    describe('## Success cases', () => {
      it('should return a 201 for an authorized user', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: get(normalUser, '_id', ''), role: 'normal' })
        .expect(OK));
    });
  });

  describe('## Project User update : PATCH /api/projects/{id}/users', () => {
    describe('## Success cases', () => {
      it('should return a 200 for an authorized user', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: get(normalUser, '_id', ''), role: 'editor' })
        .expect(OK));
    });

    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/users`)
        .send({ user: get(normalUser, '_id', ''), role: 'editor' })
        .expect(UNAUTHORIZED));

      it('should fail without a user', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ role: 'editor' })
        .expect(BAD_REQUEST));

      it('should fail without role', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: get(normalUser, '_id', '') })
        .expect(BAD_REQUEST));

      it('should fail with a wrong user', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: 'toto', role: 'editor' })
        .expect(BAD_REQUEST));

      it('should fail with a wrong role', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: get(normalUser, '_id', ''), role: 'toto' })
        .expect(BAD_REQUEST));

      it('should fail for an unexisting project', () =>
        request(HOST)
        .patch(`/api/projects/${new mongoose.Types.ObjectId()}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: get(normalUser, '_id', ''), role: 'editor' })
        .expect(NOT_FOUND));

      it('should fail for an unexisting user', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: new mongoose.Types.ObjectId(), role: 'editor' })
        .expect(NOT_FOUND));
    });
  });

  describe('## Project user unregister : DELETE /api/projects/{id}/users', () => {
    describe('## Success cases', () => {
      it('should succeed for a register user', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: get(normalUser, '_id', '') })
        .expect(ACCEPTED));
    });

    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/users`)
        .send({ user: get(normalUser, '_id', ''), role: 'normal' })
        .expect(UNAUTHORIZED));

      it('should fail without a user', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ })
        .expect(BAD_REQUEST));

      it('should fail for a wrong user', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: 'toto' })
        .expect(BAD_REQUEST));

      it('should fail for an unexisting project', () =>
        request(HOST)
        .delete(`/api/projects/${new mongoose.Types.ObjectId()}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: get(normalUser, '_id', '') })
        .expect(NOT_FOUND));

      it('should fail for a user not following', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: get(normalUser, '_id', '') })
        .expect(NOT_FOUND));
    });
  });
});


