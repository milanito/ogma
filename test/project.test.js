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
import Project from '../src/database/models/project.model';
import exporters from '../src/exporter';
import {
  userTest, userCreate, HOST, createUsers,
  createFullProject, fullProject
} from './seed';

describe('# Project Tests', () => {
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

  describe('## Project List : GET /api/projects', () => {
    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .get('/api/projects')
        .expect(UNAUTHORIZED));
    });

    describe('## Success cases', () => {
      it('should return a 200 for an authorized user', () =>
        request(HOST)
        .get('/api/projects')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(OK));
    });
  });

  describe('## Project List : POST /api/projects', () => {
    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .post('/api/projects')
        .send({ name: 'new project' })
        .expect(UNAUTHORIZED));

      it('should fail without a name', () =>
        request(HOST)
        .post('/api/projects')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ })
        .expect(BAD_REQUEST));

      it('should fail for an existing project', () =>
        request(HOST)
        .post('/api/projects')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(pick(fullProject, ['name']))
        .expect(CONFLICT));
    });

    describe('## Success cases', () => {
      it('should return a 201 for an authorized user', () =>
        request(HOST)
        .post('/api/projects')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ name: 'new project' })
        .expect(CREATED));
    });
  });
});
