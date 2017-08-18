'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var projectSchema = new _mongoose2.default.Schema({
  name: {
    type: String,
    required: true
  },
  users: [{
    user: {
      type: _mongoose2.default.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      default: 'editor',
      enum: ['editor', 'owner']
    }
  }],
  locales: [{
    code: {
      type: String,
      required: true
    },
    keys: {
      type: _mongoose2.default.Schema.Types.Mixed,
      default: {}
    }
  }],
  keys: [String]
});

projectSchema.pre('save', function preSave(next) {
  var self = this;
  self.constructor.findOne({ name: self.name }).exec().then(function (project) {
    if (self.isNew && project) {
      return next(new Error('Project name already registered'));
    }
    return next();
  });
});

projectSchema.virtual('small').get(function getProfile() {
  return (0, _lodash.pick)(this, ['_id', 'name']);
});

exports.default = _mongoose2.default.model('Project', projectSchema);