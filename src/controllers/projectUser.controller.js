import { ACCEPTED } from 'http-status';
import {
  conflict, notFound, badImplementation
} from 'boom';
import {
  get, merge, map, set,
  pick, findIndex,
  isNull, isEqual,
} from 'lodash';

import Project from '../database/models/project.model';
import { projectsListQuery } from '../helpers';

/**
 * This function lists the project's user
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const getUsers = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .populate('users.user')
  .exec()
  .then((project) => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    return reply(map(project.users, user =>
      merge(pick(get(user, 'user', {}), ['_id', 'username', 'email']),
        pick(user, ['role']))));
  })
  .catch(err => reply(badImplementation(err)));

/**
 * This function add a new user to the project
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const addUser = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then(project => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    const idx = findIndex(get(project, 'users', []), usr =>
      isEqual(get(usr, 'user', '').toString(), get(request, 'payload.user', '')));

    if (idx > -1) {
      return reply(conflict(new Error('User already in project')));
    }
    project.users.push(get(request, 'payload', {}));
    project.markModified('users');

    return project.save()
    .then(project => reply(map(get(project, 'users', []), user =>
      pick(user, ['role', 'user']))));
  })
  .catch(err => reply(badImplementation(err)));

/**
 * This function update a user role to a project
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const updateUser = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then(project => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    const idx = findIndex(get(project, 'users', []), usr =>
      isEqual(get(usr, 'user', '').toString(), get(request, 'payload.user', '')));

    if (isEqual(idx, -1)) {
      return reply(notFound(new Error('User is not in project')));
    }
    set(project.users[idx], 'role', get(request, 'payload.role', ''));
    project.markModified('users');

    return project.save()
    .then(project => reply(map(project.users, user =>
      pick(user, ['role', 'user']))));
  })
  .catch(err => reply(badImplementation(err)));

/**
 * This function removes a user from a project
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const deleteUser = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then(project => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    const idx = findIndex(project.users, usr =>
      isEqual(get(usr, 'user', '').toString(), get(request, 'params.user', '')));

    if (isEqual(idx, -1)) {
      return reply(notFound(new Error('User is not in project')));
    }

    project.users.splice(idx, 1);
    project.markModified('users');

    return project.save()
    .then(project => reply(map(project.users, user =>
      pick(user, ['role', 'user']))).code(ACCEPTED));
  })
  .catch(err => reply(badImplementation(err)));

/**
 * This function gets a user role for a project
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const roleProject = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then(project => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    const idx = findIndex(get(project, 'users', []), usr =>
      isEqual(get(usr, 'user', '').toString(), get(request, 'auth.credentials._id', '')));

    if (isEqual(idx, -1)) {
      if (!isEqual(get(request, 'auth.credentials.role'), 'admin')) {
        return reply({ role: 'admin' });
      }
      return reply(notFound(new Error('User is not in project')));
    }
    return reply({ role: get(project.users[idx], 'role') });
  })
  .catch(err => reply(badImplementation(err)));
