import mongoose from 'mongoose';
import crypto from 'crypto';
import Promise from 'bluebird';
import {
  set, get, isEqual, isNull
} from 'lodash';

/**
 * The client schema consists of :
 * - A name
 * - A token
 * - An owner
 * - A projects list
 */
const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  return self.constructor
  .findOne({ name: self.name })
  .exec()
  .then(client => {
    if (client &&
      (isEqual(get(self, 'isNew', false), true) ||
        !isEqual(get(client, '_id', ''), get(self, '_id', '')))) {
      return next(new Error('Client name already registered'));
    }
    if (!isNull(get(self, 'token', null))) {
      return crypto.randomBytes(48, (err, buffer) => {
        if (err) {
          return next(err);
        }
        set(self, 'token', buffer.toString('hex'));
        return next();
      });
    }
    return next();
  })
  .catch(err => next(err));
});

export default mongoose.model('Client', clientSchema);
