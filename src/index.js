
import database from './database';
import server from './server';
import routes from './routes';

const start = () =>
  database()
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
