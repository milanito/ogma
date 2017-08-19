import request from 'supertest';
import mongoose from 'mongoose';
import { expect } from 'chai';
import {
  BAD_REQUEST, UNAUTHORIZED, CONFLICT, CREATED,
  NOT_FOUND, OK
} from 'http-status';
import {
  forEach, omit, get, merge, clone, keys
} from 'lodash';

import User from '../src/database/models/user.model';
import Project from '../src/database/models/project.model';
import exporters from '../src/exporter';
import {
  userTest, userCreate, HOST, createUsers,
  createFullProject
} from './seed';

describe('# Export Tests', () => {
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

  describe('## Export Translation : GET /api/export/locale/{locale}/type/{type}', () => {
    forEach(keys(exporters), type => {
      describe(`## Error cases for ${type} type`, () => {
        it(`should fail without a token for a ${type} type`, () =>
          request(HOST)
          .get(`/api/export/project/${get(project, '_id', '')}/locale/${locale}/type/${type}`)
          .expect(UNAUTHORIZED));

        it(`should return a 404 for an unauthorized user for a ${type} type`, () =>
          request(HOST)
          .get(`/api/export/project/${get(project, '_id', '')}/locale/${locale}/type/${type}`)
          .set('Authorization', `Bearer ${tokenUser}`)
          .expect(NOT_FOUND));

        it(`should return a 400 for an unexisting locale for a ${type} type`, () =>
          request(HOST)
          .get(`/api/export/project/${get(project, '_id', '')}/locale/toto/type/${type}`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .expect(BAD_REQUEST));

        it(`should return a 404 for an locale not in project for a ${type} type`, () =>
          request(HOST)
          .get(`/api/export/project/${get(project, '_id', '')}/locale/nso_ZA/type/${type}`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .expect(NOT_FOUND));
      });

      describe(`## Success cases for ${type} type`, () => {
        it(`should return a 200 for an authorized user for a ${type} type`, () =>
          request(HOST)
          .get(`/api/export/project/${get(project, '_id', '')}/locale/${locale}/type/${type}`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .expect(OK));
      });
    });
  });
});

