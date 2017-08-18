import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Promise from 'bluebird';
import {
  pick, set, get,
  isEmpty
} from 'lodash';

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
   * @method comparePassword
   * @param { String } password
   * @return Promise
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
    if (self.isNew && user) {
      return next(new Error('Email already registered'));
    }
    if (isEmpty(get(self, 'password', ''))) {
      return next();
    }
    return true;
  })
  .then(() =>
    bcrypt.hash(self.password, 10, (err, hash) => {
      if (err) {
        return next(err);
      }
      set(self, 'hash', hash);
      set(self, 'password', null);
      return next();
    }));
});

export default mongoose.model('User', userSchema);
