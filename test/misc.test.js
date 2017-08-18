import request from 'supertest';
import start from '../src';
import { OK } from 'http-status';
import { userAdmin, userTest, userCreate, HOST } from './seed';

describe('# Misc Tests', () => {
  it('should return 200 when calling health check', () =>
    request(HOST)
    .get('/api/health-check')
    .expect(OK));
});
