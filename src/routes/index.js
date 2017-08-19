import Promise from 'bluebird';
import { map } from 'lodash';

import userRoutes from './user.routes';
import projectRoutes from './project.routes';
import authRoutes from './auth.routes';
import exportRoutes from './export.routes';
import miscRoutes from './misc.routes';

/**
 * The routers list, which list each routes plugin
 * with its prefix
 */
const ROUTERS = [{
    register: userRoutes,
    prefix: '/api/users'
  }, {
    register: projectRoutes,
    prefix: '/api/projects'
  }, {
    register: authRoutes,
    prefix: '/api/auth'
  }, {
    register: exportRoutes,
    prefix: '/api/export'
  }, {
    register: miscRoutes,
    prefix: '/api'
}];

/**
 * This function registers the server's routes
 * @param { Object } server the Hapi server
 * @return { Promise } a prmise that resolves the
 * server
 */
export default server =>
  Promise.all(map(ROUTERS, ({ register, prefix }) =>
    new Promise((resolve, reject) =>
      server.register({ register }, { routes: { prefix } }, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve(true);
      }))))
  .then(() =>
    new Promise(resolve => resolve(server)));

