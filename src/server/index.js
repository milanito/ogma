import hapiBunyan from 'hapi-bunyan';
import bunyan from 'bunyan';
import Brok from 'brok';
import jwt2 from 'hapi-auth-jwt2';
import rbac from 'hapi-rbac';
import vision from 'vision';
import inert from 'inert';
import lout from 'lout';
import { Server } from 'hapi';
import { get, isNull } from 'lodash';

import User from '../database/models/user.model';
import { api, log } from '../config';

const PLUGINS = [{
  register: hapiBunyan,
  options: {
    logger: bunyan.createLogger(log)
  }
}, {
  register: Brok,
  options: {
    compress: { quality: 3 }
  }
}, {
  register: jwt2
}, {
  register: rbac
}, {
  register: vision
}, {
  register: inert
}, {
  register: lout
}];

const validateUser = (decoded, request, callback) =>
  User.findById(get(decoded, '_id', ''))
  .exec()
  .then((user) => {
    if (isNull(user)) {
      return callback(null, false);
    }
    return callback(null, true);
  })
  .catch(err => callback(err));

export default () =>
  new Promise((resolve, reject) => {
    const server = new Server();
    server.connection({ port: get(api, 'port', 0), host: get(api, 'host', '') });
    server.register(PLUGINS, (err) => {
      if (err) {
        return reject(err);
      }
      server.auth.strategy('jwt', 'jwt', {
        key: get(api, 'secret', ''),
        validateFunc: validateUser,
        verifyOptions: { algorithms: ['HS256'] }
      });
      server.auth.default('jwt');
      return resolve(server);
    });
  });
