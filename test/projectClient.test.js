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

describe('# Project Client Tests', () => {
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

  describe('## Project Clients List : GET /api/projects/{id}/clients', () => {
    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .get(`/api/projects/${get(project, '_id', '')}/clients`)
        .expect(UNAUTHORIZED));

      it('should fail for a wrong id', () =>
        request(HOST)
        .get('/api/projects/toto/clients')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(BAD_REQUEST));

      it('should fail for an unexisting project', () =>
        request(HOST)
        .get(`/api/projects/${new mongoose.Types.ObjectId()}/clients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(NOT_FOUND));

      it('should return NOT_FOUND when no clients', () =>
        request(HOST)
        .get(`/api/projects/${get(project, '_id', '')}/clients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(NOT_FOUND));
    });

    describe('## Success cases', () => {
      before(() => createClient(adminUser, { projects: [get(project, '_id', '')] }));

      it('should return a 200 for an authorized user', () =>
        request(HOST)
        .get(`/api/projects/${get(project, '_id', '')}/clients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(OK));
    });
  });

  describe('## Project Client register : POST /api/projects/{id}/clients', () => {
    describe('## Error cases', () => {
      let client;

      before(() =>
        Client.findOne().exec()
        .then((clnt) => {
          client = clnt;
          return true;
        }));

      it('should fail without a token', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/clients`)
        .send({ client: get(client, '_id' ,'') })
        .expect(UNAUTHORIZED));

      it('should fail without a client', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/clients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ })
        .expect(BAD_REQUEST));

      it('should fail with a wrong client', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/clients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ client: 'toto' })
        .expect(BAD_REQUEST));

      it('should fail for an unexisting client', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/clients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ client: new mongoose.Types.ObjectId() })
        .expect(NOT_FOUND));

      it('should fail for an unexisting project', () =>
        request(HOST)
        .post(`/api/projects/${new mongoose.Types.ObjectId()}/clients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ client: get(client, '_id' ,'') })
        .expect(NOT_FOUND));

      it('should fail for an already registered client', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/clients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ client: get(client, '_id' ,'') })
        .expect(CONFLICT));
    });

    describe('## Success cases', () => {
      let client;

      before(() => Client.findOneAndUpdate({}, {
        $set: {
          projects: []
        }
      }).exec()
      .then((clnt) => {
        client = clnt;
        return true;
      }));

      it('should return a 201 for an authorized user', () =>
        request(HOST)
        .post(`/api/projects/${get(project, '_id', '')}/clients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ client: get(client, '_id', '') })
        .expect(OK));
    });
  });

  describe('## Project Client unregister : DELETE /api/projects/{id}/clients', () => {
    let client;

    before(() => Client.findOne({})
    .exec()
    .then((clnt) => {
      client = clnt;
      return true;
    }));

    describe('## Success cases', () => {
      it('should fail for a client not following', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/clients/${get(client, '_id' ,'')}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(ACCEPTED));
    });

    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/clients/${get(client, '_id' ,'')}`)
        .expect(UNAUTHORIZED));

      it('should fail for a wrong client', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/clients/toto`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(BAD_REQUEST));

      it('should fail for an unexisting project', () =>
        request(HOST)
        .delete(`/api/projects/${new mongoose.Types.ObjectId()}/clients/${get(client, '_id' ,'')}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(NOT_FOUND));

      it('should fail for an unexisting client', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/clients/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(NOT_FOUND));

      it('should fail for a client not following', () =>
        request(HOST)
        .delete(`/api/projects/${get(project, '_id', '')}/clients/${get(client, '_id' ,'')}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(NOT_FOUND));
    });
  });
});

