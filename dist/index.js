'use strict';

var _database = require('./database');

var _database2 = _interopRequireDefault(_database);

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var start = function start() {
  return (0, _database2.default)().then(_server2.default).then(_routes2.default).then(function (server) {
    return new Promise(function (resolve, reject) {
      return server.start(function (err) {
        if (err) {
          return reject(err);
        }
        return resolve(server);
      });
    });
  }).then(function (server) {
    return console.log('Server running at: ' + server.info.uri);
  }).catch(function (err) {
    return console.log(err);
  });
};

if (!module.parent) {
  start();
} else {
  module.exports = start;
}