import {
  isEqual, merge, isNull, get
} from 'lodash';

import User from '../database/models/user.model';

export const projectsListQuery = ({ _id, role }, isEditor = false) => {
  const query = {};
  if (isEqual(role, 'user')) {
    merge(query, { 'users.user': _id });

    if (isEditor) {
      merge(query, { 'users.role': { $in: ['editor', 'owner'] } });
    }
  }

  return query;
};

export const validateUser = (decoded, request, callback) =>
  User.findById(get(decoded, '_id', ''))
  .exec()
  .then((user) => {
    if (isNull(user)) {
      return callback(null, false);
    }
    return callback(null, true);
  })
  .catch(err => callback(err));
