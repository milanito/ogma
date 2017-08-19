import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  pick, set, get,
  isEmpty, isEqual
} from 'lodash';

/**
 * The user schema consists of :
 * - An email, unique, for the user
 * - A username
 * - A role
 * - A password, that is null and only used for pre
 *   save hook
 * - A hashed password
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin']
  },
  password: {
    type: String
  },
  hash: {
    type: String
  }
});

userSchema.virtual('profile').get(function getProfile() {
  return pick(this, ['_id', 'email', 'role']);
});

userSchema.methods = {
  /**
   * This function is used to compare the user password with
   * a given password
   * @param { String } password The password to check
   * @return { Promise } A promise that resolves a boolean
   * indicating if passwords match
   */
  comparePassword: function comparePassword(password) {
    const self = this;
    return bcrypt.compare(password, get(self, 'hash', ''));
  }
};

userSchema.pre('save', function preSave(next) {
  const self = this;
  self.constructor
  .findOne({ email: self.email })
  .exec()
  .then((user) => {
    if (user &&
      (isEqual(get(self, 'isNew', false), true) ||
        !isEqual(get(user, '_id', ''), get(self, '_id', '')))) {
      return next(new Error('Email already registered'));
    }
    if (!isEmpty(get(self, 'password', ''))) {
      return bcrypt.hash(self.password, 10, (err, hash) => {
        if (err) {
          return next(err);
        }
        set(self, 'hash', hash);
        set(self, 'password', null);
        return next();
      });
    }
    return next();
  })
  .catch(err => next(err));
});

export default mongoose.model('User', userSchema);
