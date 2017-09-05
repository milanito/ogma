import mongoose from 'mongoose';
import { pick, isEqual, get, map, merge } from 'lodash';

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
      enum: ['editor', 'owner', 'normal']
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
    if (project &&
      (isEqual(get(self, 'isNew', false), true) ||
        !isEqual(get(project, '_id', ''), get(self, '_id', '')))) {
      return next(new Error('Project name already registered'));
    }
    return next();
  })
  .catch(err => next(err));
});

projectSchema.virtual('small').get(function getProfile() {
  return merge(pick(this, ['_id', 'name', 'keys']), {
    locales: map(get(this, 'locales', []), locale => pick(locale, ['code']))
  });
});

export default mongoose.model('Project', projectSchema);
