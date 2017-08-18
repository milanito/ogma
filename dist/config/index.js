'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var database = exports.database = {
  uri: process.env.DB_HOST || 'mongodb://localhost/translation',
  options: {
    useMongoClient: true
  }
};

var api = exports.api = {
  port: process.env.API_PORT || 3000,
  host: process.env.API_HOST || '0.0.0.0',
  secret: process.env.SECRET || 'NeverShareYourSecret'
};

var log = exports.log = {
  level: process.env.LOG_LEVEL || 'debug',
  name: process.env.LOG_NAME || 'translation-api'
};