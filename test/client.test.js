import request from 'supertest';
import mongoose from 'mongoose';
import { expect } from 'chai';
import {
  BAD_REQUEST, UNAUTHORIZED, CONFLICT, CREATED,
  NOT_FOUND, OK, ACCEPTED
} from 'http-status';
import {
  forEach, omit, get, merge, clone, pick
} from 'lodash';

import User from '../src/database/models/user.model';
import Client from '../src/database/models/client.model';
import { userTest, userCreate, HOST, createUsers, createClient, clientTest } from './seed';

describe('# Client Tests', () => {
  let tokenUser;
  let tokenAdmin;
  let adminUser;
  let normalUser;
  let clientCreated;
  const clientCreate = { name: 'create client' };

  before(() =>
    createUsers()
    .then(([admin, normal]) => {
      adminUser = get(admin, 'user', {});
      tokenAdmin = get(admin, 'token', '');
      normalUser = get(normal, 'user', {});
      tokenUser = get(normal, 'token', '');
      return createClient(adminUser);
    }));

  beforeEach(() =>
    Client.findOne().exec()
    .then((client) => {
      clientCreated = client;
      return true;
    }));

  after(() => User.remove({}).exec()
    .then(() => Client.remove({}).exec()));

  describe('## Client Listing : GET /api/clients', () => {
    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .get('/api/clients')
        .expect(UNAUTHORIZED));
    });

    describe('## Success cases', () => {
      it('should request clients', () =>
        request(HOST)
        .get('/api/clients')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(OK)
        .then(({ body }) =>
          expect(body).to.be.an('array').that.is.not.empty));
    });
  });

  describe('## Client creation : POST /api/clients', () => {
    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .post('/api/clients')
        .send(clientCreate)
        .expect(UNAUTHORIZED));

      it('should return a 400 for a missing name', () =>
        request(HOST)
        .post('/api/clients')
        .send({})
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(BAD_REQUEST));

      it('should not create a duplicate client', () =>
        request(HOST)
        .post('/api/clients')
        .send(pick(clientTest, ['name']))
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(CONFLICT));
    });

    describe('## Success cases', () => {
      it('should create a client', () =>
        request(HOST)
        .post('/api/clients')
        .send(clientCreate)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(CREATED));
    });
  });

  describe('## Client detail : GET /api/clients/{id}', () => {
    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .get(`/api/clients/${get(clientCreated, '_id', '')}`)
        .expect(UNAUTHORIZED));

      it('should not accept a wrong id', () =>
        request(HOST)
        .get(`/api/clients/toto`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(BAD_REQUEST));

      it('should return 404 on not found client', () =>
        request(HOST)
        .get(`/api/clients/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(NOT_FOUND));
    });

    describe('## Success cases', () => {
      it('should fetch a client as an admin', () =>
        request(HOST)
        .get(`/api/clients/${get(clientCreated, '_id', '')}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(OK));
    });
  });

  describe('## Client Update : PATCH /api/clients/{id}', () => {
    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .patch(`/api/clients/${get(clientCreated, '_id', '')}`)
        .send({ name: 'new name', token: false })
        .expect(UNAUTHORIZED));

      it('should not accept a wrong id', () =>
        request(HOST)
        .patch(`/api/clients/toto`)
        .send({ name: 'new name', token: false })
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(BAD_REQUEST));

      it('should not accept a wrong token', () =>
        request(HOST)
        .patch(`/api/clients/toto`)
        .send({ name: 'new name', token: 'tototo' })
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(BAD_REQUEST));

      it('should return 404 on not found client', () =>
        request(HOST)
        .patch(`/api/clients/${new mongoose.Types.ObjectId()}`)
        .send({ name: 'new name', token: false })
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(NOT_FOUND));
    });

    describe('## Success cases', () => {
      it('should update a client', () =>
        request(HOST)
        .patch(`/api/clients/${get(clientCreated, '_id', '')}`)
        .send({ name: 'new name', token: false })
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(OK));
    });
  });

  describe('## Client Delete : DELETE /api/clients/{id}', () => {
    describe('## Error cases', () => {
      it('should fail without a token', () =>
        request(HOST)
        .delete(`/api/clients/${get(clientCreated, '_id', '')}`)
        .expect(UNAUTHORIZED));

      it('should not accept a wrong id', () =>
        request(HOST)
        .delete(`/api/clients/toto`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(BAD_REQUEST));

      it('should not accept a wrong token', () =>
        request(HOST)
        .delete(`/api/clients/toto`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(BAD_REQUEST));

      it('should return 404 on not found client', () =>
        request(HOST)
        .delete(`/api/clients/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(NOT_FOUND));
    });

    describe('## Success cases', () => {
      it('should delete a client', () =>
        request(HOST)
        .delete(`/api/clients/${get(clientCreated, '_id', '')}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(ACCEPTED));
    });
  });
});

