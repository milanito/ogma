import Promise from 'bluebird';
import mongoose from 'mongoose';

import { database } from '../config';

mongoose.Promise = Promise;

/**
 * This function connects to the dabase
 * @returns { Promise } a promise that resolves
 */
export default () =>
  new Promise((resolve, reject) => {
    mongoose.connect(database.uri, database.options);
    const db = mongoose.connection;
    db.on('error', err => reject(err));
    db.once('open', () => resolve(true));
  })
