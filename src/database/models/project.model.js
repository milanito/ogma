import mongoose from 'mongoose';
import { pick } from 'lodash';

/**
 * The project schema consists of :
 * - A name, unique, for the project
 * - A users list, with a user id and a role
 * - A locales list, with a code and a translated keys
 *   list
 */
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  users: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  keys: [String]
});

projectSchema.pre('save', function preSave(next) {
  const self = this;
  self.constructor
  .findOne({ name: self.name })
  .exec()
  .then(project => {
    if (self.isNew && project) {
      return next(new Error('Project name already registered'));
    }
    return next();
  });
});

projectSchema.virtual('small').get(function getProfile() {
  return pick(this, ['_id', 'name']);
});

export default mongoose.model('Project', projectSchema);
