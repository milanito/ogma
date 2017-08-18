'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bcryptjs = require('bcryptjs');

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var userSchema = new _mongoose2.default.Schema({
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
  return (0, _lodash.pick)(this, ['_id', 'email', 'role']);
});

userSchema.methods = {
  comparePassword: function comparePassword(password) {
    var self = this;
    return _bcryptjs2.default.compare(password, (0, _lodash.get)(self, 'hash', ''));
  }
};

userSchema.pre('save', function preSave(next) {
  var self = this;
  self.constructor.findOne({ email: self.email }).exec().then(function (user) {
    if (self.isNew && user) {
      return next(new Error('Email already registered'));
    }
    if ((0, _lodash.isEmpty)((0, _lodash.get)(self, 'password', ''))) {
      return next();
    }
    return true;
  }).then(function () {
    return _bcryptjs2.default.hash(self.password, 10, function (err, hash) {
      if (err) {
        return next(err);
      }
      (0, _lodash.set)(self, 'hash', hash);
      (0, _lodash.set)(self, 'password', null);
      return next();
    });
  });
});

exports.default = _mongoose2.default.model('User', userSchema);