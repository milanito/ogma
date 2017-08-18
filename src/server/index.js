import hapiBunyan from 'hapi-bunyan';
import bunyan from 'bunyan';
import Brok from 'brok';
import jwt2 from 'hapi-auth-jwt2';
import rbac from 'hapi-rbac';
import vision from 'vision';
import inert from 'inert';
import lout from 'lout';
import { Server } from 'hapi';
import { get } from 'lodash';

import { validateUser } from '../helpers';
import { api, log } from '../config';

/**
 * This is the list of the loaded plugins
 */
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

/**
 * This functions loads the server's plugins
 * and registers the strategy for authentication
 * @return { Promise } A promise that resolves
 */
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
