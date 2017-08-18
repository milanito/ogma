export const database = {
  uri: process.env.DB_HOST || 'mongodb://localhost/translation',
  options: {
    useMongoClient: true
  }
};

export const api = {
  port: process.env.API_PORT || 3000,
  host: process.env.API_HOST || '0.0.0.0',
  secret: process.env.SECRET || 'NeverShareYourSecret'
};

export const log = {
  level: process.env.LOG_LEVEL || 'debug',
  name: process.env.LOG_NAME || 'translation-api'
};
