import {
  isEqual, merge, isNull, get
} from 'lodash';

import User from '../database/models/user.model';

/**
 * This function is used to create a query for a given
 * user to retrieve projects
 * @param { Object } user the user that want to retrieve projects
 * @param { String } user._id the user's id in database
 * @param { String } user.role the user's role in database
 * @param { Boolean } isEditor if the user is a project owner or editor
 * @return { Object } the query object
 */
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

/**
 * This function will validate a decoded token by fetching the
 * database for the user
 * @param { Object } decoded the decoded token
 * @param { Object } request the Hapi request object
 * @param { Function } callback the callback function to call
 * when the verification is done
 * @return { Void } Nothing
 */
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
