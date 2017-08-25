import request from 'supertest';
import mongoose from 'mongoose';
import { expect } from 'chai';
import {
  BAD_REQUEST, UNAUTHORIZED, CONFLICT, CREATED,
  NOT_FOUND, OK, ACCEPTED, FORBIDDEN
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

describe('# Project Key Tests', () => {
  let tokenUser;
  let tokenAdmin;
  let adminUser;
  let normalUser;
  let project;
  const locale = 'en_US';

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

  describe('## Project Key List : GET /api/projects/{id}/keys', () => {
    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .get(`/api/projects/${get(project, '_id', '')}/keys`)
        .expect(UNAUTHORIZED));

      it('should fail for a wrong id', () =>
        request(HOST)
        .get('/api/projects/toto/keys')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(BAD_REQUEST));

      it('should fail for an unexisting project', () =>
        request(HOST)
        .get(`/api/projects/${new mongoose.Types.ObjectId()}/clients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(NOT_FOUND));
    });

    describe('## Success cases', () => {
      it('should return a 200 for an authorized user', () =>
        request(HOST)
        .get(`/api/projects/${get(project, '_id', '')}/keys`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(OK));
    });
  });

  describe('## Project Keys register : POST /api/projects/{id}/keys', () => {
    describe('## Success cases', () => {
      it('should return a 200 for an authorized user with one key', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/keys`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ keys: [ 'test.key2' ] })
        .expect(OK));

      it('should return a 200 for an authorized user with an existing key', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/keys`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ keys: [ 'test.key2' ] })
        .expect(OK));

      it('should return a 200 for an authorized user with more than one key', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/keys`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ keys: [ 'test.key2', 'test.key3' ] })
        .expect(OK));

      it('should return a 200 for an authorized user with more than one the same key', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/keys`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ keys: [ 'test.key2', 'test.key2' ] })
        .expect(OK));
    });

    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/keys`)
        .send({ locale: 'fr_FR' })
        .expect(UNAUTHORIZED));

      it('should fail without keys', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/keys`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ })
        .expect(BAD_REQUEST));

      it('should fail with empty keys', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/keys`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ keys: [] })
        .expect(BAD_REQUEST));

      it('should fail for an unexisting project', () =>
        request(HOST)
        .post(`/api/projects/${new mongoose.Types.ObjectId()}/keys`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ keys: [ 'test.key2' ] })
        .expect(NOT_FOUND));
    });
  });

  describe('## Project Locale update : PATCH /api/projects/{id}/keys', () => {
    describe('## Success cases', () => {
      it('should return a 200 for an authorized user with one key', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/keys`)
        .send({ keys: { 'test.key2': 'test.key4' }})
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(OK));

      it('should return a 200 for an authorized user with more than one key', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/keys`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ keys: { 'test.key4': 'test.key2', 'test.key3': 'test.key5' }})
        .expect(OK));

      it('should be ok for an unexisting key', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/keys`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ keys: { 'test.key8': 'test.key4' }})
        .expect(OK));
    });

    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/keys`)
        .send({ locale, keys: { 'test.key': 'toto' }})
        .expect(UNAUTHORIZED));

      it('should fail without keys', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/keys`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ })
        .expect(BAD_REQUEST));

      it('should fail for an unexisting project', () =>
        request(HOST)
        .patch(`/api/projects/${new mongoose.Types.ObjectId()}/keys`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ keys: { 'test.key2': 'test.key4' }})
        .expect(NOT_FOUND));
    });
  });

  describe('## Project locale unregister : DELETE /api/projects/{id}/keys', () => {
    describe('## Success cases', () => {
      it('should return OK for one key', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/keys`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ keys: [ 'test.key2' ] })
        .expect(ACCEPTED));

      it('should return OK for one unexisting key', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/keys`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ keys: [ 'test.key2' ] })
        .expect(ACCEPTED));

      it('should return OK for more than one key', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/keys`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ keys: [ 'test.key', 'test.key2' ] })
        .expect(ACCEPTED));
    });

    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/keys`)
        .send({ keys: [ 'test.key2' ] })
        .expect(UNAUTHORIZED));

      it('should fail without keys', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/keys`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ })
        .expect(BAD_REQUEST));

      it('should fail for an unexisting project', () =>
        request(HOST)
        .delete(`/api/projects/${new mongoose.Types.ObjectId()}/keys`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ keys: [ 'test.key2' ] })
        .expect(NOT_FOUND));
    });
  });
});



