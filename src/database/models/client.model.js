import mongoose from 'mongoose';
import crypto from 'crypto';
import Promise from 'bluebird';
import {
  set, get, isEqual
} from 'lodash';

/**
 * The client schema consists of :
 * - A token
 * - A projects list
 */
const clientSchema = new mongoose.Schema({
  token: {
    type: String,
  },
  projects: {
    type: Array,
    default: []
  },
});

clientSchema.methods = {
  /**
   * This function is used to compare the client token with
   * a given token
   * @param { String } token The token to check
   * @return { Promise } A promise that resolves a boolean
   * indicating if passwords match
   */
  compareToken: function compareToken(token) {
    const self = this;
    return new Promise((resolve) => {
      if (isEqual(get(self, 'token', ''), token)) {
        return resolve(true);
      }
      return resolve(false);
    });
  }
};

clientSchema.pre('save', function preSave(next) {
  const self = this;
  if (isEqual(get(self, 'isNew', false), true)) {
    return crypto.randomBytes(48, (err, buffer) => {
      if (err) {
        return next(err);
      }
      set(self, 'token', buffer.toString('hex'));
      return next();
    });
  }
  return next();
});

export default mongoose.model('Client', clientSchema);
