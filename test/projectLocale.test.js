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

describe('# Project Locale Tests', () => {
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

  describe('## Project Locales List : GET /api/projects/{id}/locales', () => {
    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .get(`/api/projects/${get(project, '_id', '')}/locales`)
        .expect(UNAUTHORIZED));

      it('should fail for a wrong id', () =>
        request(HOST)
        .get('/api/projects/toto/locales')
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
        .get(`/api/projects/${get(project, '_id', '')}/locales`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(OK));
    });
  });

  describe('## Project Locale register : POST /api/projects/{id}/locales', () => {
    describe('## Success cases', () => {
      it('should return a 200 for an authorized user', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/locales`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ locale })
        .expect(OK));
    });

    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/locales`)
        .send({ locale: 'fr_FR' })
        .expect(UNAUTHORIZED));

      it('should fail without a locale', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/locales`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ })
        .expect(BAD_REQUEST));

      it('should fail with a wrong locale', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/locales`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ locale: 'qsdfsdf' })
        .expect(BAD_REQUEST));

      it('should fail for an unexisting project', () =>
        request(HOST)
        .post(`/api/projects/${new mongoose.Types.ObjectId()}/locales`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ locale })
        .expect(NOT_FOUND));

      it('should return a CONFLICT for an existing locale', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/locales`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ locale })
        .expect(CONFLICT));
    });
  });

  describe('## Project Locale update : PATCH /api/projects/{id}/locales', () => {
    describe('## Success cases', () => {
      it('should return a 200 for an authorized user', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/locales`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ locale, keys: { 'test.key': 'toto' }})
        .expect(OK));
    });

    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/locales`)
        .send({ locale, keys: { 'test.key': 'toto' }})
        .expect(UNAUTHORIZED));

      it('should fail without a locale', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/locales`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ keys: { 'test.key': 'toto' }})
        .expect(BAD_REQUEST));

      it('should fail without keys', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/locales`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ locale })
        .expect(BAD_REQUEST));

      it('should fail with a wrong locale', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/locales`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ locale: 'qsdfqsf', keys: { 'test.key': 'toto' }})
        .expect(BAD_REQUEST));

      it('should fail for an unexisting project', () =>
        request(HOST)
        .patch(`/api/projects/${new mongoose.Types.ObjectId()}/locales`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ locale, keys: { 'test.key': 'toto' }})
        .expect(NOT_FOUND));

      it('should fail for an unexisting key', () =>
        request(HOST)
        .patch(`/api/projects/${get(project, '_id', '')}/locales`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ locale, keys: { 'test': 'toto' }})
        .expect(FORBIDDEN));
    });
  });

  describe('## Project locale unregister : DELETE /api/projects/{id}/locales', () => {
    describe('## Success cases', () => {
      it('should return OK for a right locale', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/locales/${locale}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(ACCEPTED));
    });

    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/locales/${locale}`)
        .expect(UNAUTHORIZED));

      it('should fail for a wrong locale', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/locales/toto`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(BAD_REQUEST));

      it('should fail for an unexisting project', () =>
        request(HOST)
        .delete(`/api/projects/${new mongoose.Types.ObjectId()}/locales/${locale}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(NOT_FOUND));

      it('should fail for a locale not registered', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/locales/${locale}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(NOT_FOUND));
    });
  });
});


