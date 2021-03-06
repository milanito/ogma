import database from './database';
import server from './server';
import routes from './routes';
import seed from './config/seed';

const seedAdmin = process.env.ADMIN_USER || false;

/**
 * This is the start function that will do
 * the following :
 * - Connect to the database
 * - Configure the server
 * - Configure the routes
 * - Start the server
 * @return { Void } Nothing
 */
const start = () =>
  database()
  .then(() => {
    if (seedAdmin) {
      return seed();
    }
    return true;
  })
  .then(server)
  .then(routes)
  .then(server =>
    new Promise((resolve, reject) =>
      server.start((err) => {
        if (err) {
          return reject(err);
        }
        return resolve(server);
      })))
  .then(server => console.log(`Server running at: ${server.info.uri}`))
  .catch(err => console.log(err));

if (!module.parent) {
  start();
} else {
  module.exports = start;
}
