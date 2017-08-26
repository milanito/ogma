import jwt from 'jsonwebtoken';
import request from 'supertest';
import mongoose from 'mongoose';
import { expect } from 'chai';
import {
  BAD_REQUEST, UNAUTHORIZED, CONFLICT, CREATED,
  NOT_FOUND, OK
} from 'http-status';
import {
  forEach, omit, get, merge, clone, keys, pick
} from 'lodash';

import User from '../src/database/models/user.model';
import Client from '../src/database/models/client.model';
import Project from '../src/database/models/project.model';
import exporters from '../src/exporter';
import { api } from '../src/config';
import {
  userTest, userCreate, HOST, createUsers,
  createFullProject, createClient
} from './seed';

describe('# Export Tests', () => {
  let tokenUser;
  let tokenAdmin;
  let adminUser;
  let normalUser;
  let tokenClient;
  let tokenClientFail;
  let tokenClientNotExists;
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
      return createClient(adminUser, { projects: [get(project, '_id', '')] })
      .then(() => createClient(adminUser, { name: 'Client fail', projects: [] }, false));
    })
    .then(() =>
      Client.findOne({ projects: { $ne: [] } }).exec())
    .then((client) => {
      tokenClient = jwt.sign(merge(pick(client, ['_id']), { role: 'client' }),
        get(api, 'secret', ''));
      return Client.findOne({ $or: [{ projects: { $size: 0 } }, { projects: null }] })
        .exec();
    })
    .then((client) => {
      tokenClientFail = jwt.sign(merge(pick(client, ['_id']), { role: 'client' }),
        get(api, 'secret', ''));
      tokenClientNotExists = jwt.sign({
        _id: new mongoose.Types.ObjectId(),
        role: 'client'
      }, get(api, 'secret', ''));
      return true;
    }));

  after(() =>
    User.remove({}).exec()
    .then(() => Client.remove({}).exec())
    .then(() => Project.remove({}).exec()));

  describe('## Export Translation : GET /api/export/project/{id}/locale/{locale}/type/{type}', () => {
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

        it(`should return a 400 for an authorized user for a wrong type`, () =>
          request(HOST)
          .get(`/api/export/project/${get(project, '_id', '')}/locale/${locale}/type/${type}fail`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .expect(BAD_REQUEST));

        it(`should return a 400 for an wrong locale for a ${type} type`, () =>
          request(HOST)
          .get(`/api/export/project/${get(project, '_id', '')}/locale/toto/type/${type}`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .expect(BAD_REQUEST));

        it(`should return a 404 for an locale not in project for a ${type} type`, () =>
          request(HOST)
          .get(`/api/export/project/${get(project, '_id', '')}/locale/nso_ZA/type/${type}`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .expect(NOT_FOUND));

        it(`should return a 400 for an authorized user for a wrong project id a ${type} type`, () =>
          request(HOST)
          .get(`/api/export/project/toto/locale/${locale}/type/${type}`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .expect(BAD_REQUEST));

        it(`should return a 404 for an authorized user for a not existing project for a ${type} type`, () =>
          request(HOST)
          .get(`/api/export/project/${new mongoose.Types.ObjectId()}/locale/${locale}/type/${type}`)
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

  describe('## Export Translation Projects: POST /api/export/projects/locale/{locale}/type/{type}', () => {
    forEach(keys(exporters), type => {
      describe(`## Error cases for ${type} type`, () => {
        it(`should fail without a token for a ${type} type`, () =>
          request(HOST)
          .post(`/api/export/projects/locale/${locale}/type/${type}`)
          .send({ projects: [get(project, '_id', '')] })
          .expect(UNAUTHORIZED));

        it(`should return a 404 for an unauthorized user for a ${type} type`, () =>
          request(HOST)
          .post(`/api/export/projects/locale/${locale}/type/${type}`)
          .send({ projects: [get(project, '_id', '')] })
          .set('Authorization', `Bearer ${tokenUser}`)
          .expect(NOT_FOUND));

        it(`should return a 400 for an authorized user for a wrong type`, () =>
          request(HOST)
          .post(`/api/export/projects/locale/${locale}/type/${type}fail`)
          .send({ projects: [get(project, '_id', '')] })
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .expect(BAD_REQUEST));

        it(`should return a 400 for an unexisting locale for a ${type} type`, () =>
          request(HOST)
          .post(`/api/export/projects/locale/toto/type/${type}`)
          .send({ projects: [get(project, '_id', '')] })
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .expect(BAD_REQUEST));

        it(`should return a 404 for an locale not in project for a ${type} type`, () =>
          request(HOST)
          .post(`/api/export/projects/locale/nso_ZA/type/${type}`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({ projects: [get(project, '_id', '')] })
          .expect(NOT_FOUND));

        it(`should return a 400 for an authorized user for a wrong project id a ${type} type`, () =>
          request(HOST)
          .post(`/api/export/projects/locale/${locale}/type/${type}`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({ projects: ['toto'] })
          .expect(BAD_REQUEST));

        it(`should return a 404 for an authorized user for all not existing project id a ${type} type`, () =>
          request(HOST)
          .post(`/api/export/projects/locale/${locale}/type/${type}`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({ projects: [new mongoose.Types.ObjectId()] })
          .expect(NOT_FOUND));

        it(`should return a 404 for an authorized user for a not existing project id a ${type} type`, () =>
          request(HOST)
          .post(`/api/export/projects/locale/${locale}/type/${type}`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({ projects: [get(project, '_id', ''), new mongoose.Types.ObjectId()] })
          .expect(NOT_FOUND));

        it(`should return a 400 for an authorized user with no projects for a ${type} type`, () =>
          request(HOST)
          .post(`/api/export/projects/locale/${locale}/type/${type}`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({ })
          .expect(BAD_REQUEST));

        it(`should return a 400 for an authorized user with empty projects for a ${type} type`, () =>
          request(HOST)
          .post(`/api/export/projects/locale/${locale}/type/${type}`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({ projects: [] })
          .expect(BAD_REQUEST));
      });

      describe(`## Success cases for ${type} type`, () => {
        it(`should return a 200 for an authorized user for a ${type} type`, () =>
          request(HOST)
          .post(`/api/export/projects/locale/${locale}/type/${type}`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({ projects: [get(project, '_id', '')] })
          .expect(OK));
      });
    });
  });

  describe('## Export Translation client: GET /api/export/locale/{locale}/type/{type}', () => {
    forEach(keys(exporters), type => {
      describe(`## Error cases for ${type} type`, () => {
        it(`should fail without a token for a ${type} type`, () =>
          request(HOST)
          .get(`/api/export/locale/${locale}/type/${type}`)
          .expect(UNAUTHORIZED));

        it(`should return a 403 for an unauthorized user for a ${type} type`, () =>
          request(HOST)
          .get(`/api/export/locale/${locale}/type/${type}`)
          .set('Authorization', `Bearer ${tokenUser}`)
          .expect(UNAUTHORIZED));

        it(`should return a 400 for an authorized client for a wrong type`, () =>
          request(HOST)
          .get(`/api/export/locale/${locale}/type/${type}fail`)
          .set('Authorization', `Bearer ${tokenClient}`)
          .expect(BAD_REQUEST));

        it(`should return a 400 for an wrong locale for a ${type} type`, () =>
          request(HOST)
          .get(`/api/export/locale/toto/type/${type}`)
          .set('Authorization', `Bearer ${tokenClient}`)
          .expect(BAD_REQUEST));

        it(`should return a 404 for an locale not in project for a ${type} type`, () =>
          request(HOST)
          .get(`/api/export/locale/nso_ZA/type/${type}`)
          .set('Authorization', `Bearer ${tokenClient}`)
          .expect(NOT_FOUND));

        it(`should return a 401 for an not existing client for a ${type} type`, () =>
          request(HOST)
          .get(`/api/export/locale/${locale}/type/${type}`)
          .set('Authorization', `Bearer ${tokenClientNotExists}`)
          .expect(UNAUTHORIZED));

        it(`should return a 404 for an authorized client with no project for a ${type} type`, () =>
          request(HOST)
          .get(`/api/export/locale/${locale}/type/${type}`)
          .set('Authorization', `Bearer ${tokenClientFail}`)
          .expect(NOT_FOUND));
      });

      describe(`## Success cases for ${type} type`, () => {
        it(`should return a 200 for an authorized client for a ${type} type`, () =>
          request(HOST)
          .get(`/api/export/locale/${locale}/type/${type}`)
          .set('Authorization', `Bearer ${tokenClient}`)
          .expect(OK));
      });
    });
  });
});

