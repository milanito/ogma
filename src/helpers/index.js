import {
  isEqual, merge, isNull, get
} from 'lodash';

import User from '../database/models/user.model';
import Client from '../database/models/client.model';

/**
 * This function is used to create a query for a given
 * user to retrieve clients
 * @param { Object } user the user that want to retrieve clients
 * @param { String } id the project id
 * @return { Object } the query object
 */
export const clientsListQuery = (user, id = null) => {
  if (isEqual(get(user, 'role', 'user'), 'user')) {
    return { owner: get(user, '_id', '') };
  }
  if (!isNull(id)) {
    return { projects: id };
  }
  return {};
};

/**
 * This function is used to create a query for a given
 * user to a given client
 * @param { String } _id the client id
 * @param { Object } user the user
 * @return { Object } the query object
 */
export const clientQuery = (_id, user) => {
  const query = { _id };
  if (isEqual(get(user, 'role', ''), 'user')) {
    merge(query, { 'owner': get(user, '_id', '') });
  }

  return query;
};

/**
 * This function is used to create a query for a given
 * user to retrieve projects
 * @param { Object } user the user that want to retrieve projects
 * @param { String } _id the project id
 * @return { Object } the query object
 */
export const projectsListQueryWithClient = (user, _id) => {
  const query = { _id };
  if (isEqual(get(user, 'role', ''), 'user')) {
    merge(query, { 'users.user': get(user, '_id', '') });
    merge(query, { 'users.role': { $in: ['editor', 'owner'] } });
  }

  return query;
};

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
 * This is the dictionnary for the functions to find the object
 * to validate authentication
 */
const ROLES_FETCHERS = {
  admin: id =>
    User.findById(id),
  client: id =>
    Client.findById(id),
  user: id =>
    User.findById(id)
};

/**
 * This function will validate a decoded token by fetching the
 * database for the user or the client
 * @param { Object } decoded the decoded token
 * @param { Object } request the Hapi request object
 * @param { Function } callback the callback function to call
 * when the verification is done
 * @return { Void } Nothing
 */
export const validateUser = (decoded, request, callback) =>
  get(ROLES_FETCHERS, get(decoded, 'role', ''),
    () => callback(new Error('Role does not exists')))(get(decoded, '_id', ''))
  .exec()
  .then((obj) => {
    if (isNull(obj)) {
      return callback(null, false);
    }
    return callback(null, true);
  })
  .catch(err => callback(err));
