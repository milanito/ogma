import { ACCEPTED, CREATED } from 'http-status';
import {
  conflict, notFound, badImplementation
} from 'boom';
import {
  get, clone, merge, map, set,
  isNull, remove, isEqual
} from 'lodash';

import Project from '../database/models/project.model';
import Client from '../database/models/client.model';
import { projectsListQuery } from '../helpers';

/**
 * This function lists the projects :
 * - If admin, it lists all the projects
 * - If user, it lists the user's projects
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const listProjects = (request, reply) =>
  Project
  .find(projectsListQuery(get(request, 'auth.credentials', {})))
  .exec()
  .then(projects =>
    reply(map(projects, project => project.small)))
  .catch(err => reply(badImplementation(err)));

/**
 * This function creates a new project, assigning the
 * user creating it to ownership
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const createProject = (request, reply) =>
  Project
  .create(merge(clone(get(request, 'payload', {})), {
    users: [{
      user: get(request, 'auth.credentials._id', ''),
      role: 'owner'
    }]
  }))
  .then(project => reply(project.small).code(CREATED))
  .catch(err => reply(conflict(err)));

/**
 * This function returns the project's details
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const detailProject = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}))))
  .populate('users.user')
  .exec()
  .then((project) => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    return reply(project.small);
  })
  .catch(err => reply(badImplementation(err)));

/**
 * This function update the given project
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const updateProject = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then((project) => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    set(project, 'name', get(request, 'payload.name', ''));
    project.markModified('name');
    return project.save()
      .then(proj => reply(proj.small));
  })
  .catch(err => reply(badImplementation(err)));

/**
 * This function is used to delete a project
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const deleteProject = (request, reply) =>
  Project
  .findOne(merge({
    _id: get(request, 'params.id', '')
  }, projectsListQuery(get(request, 'auth.credentials', {}), true)))
  .exec()
  .then((project) => {
    if (isNull(project)) {
      return reply(notFound(new Error('Project not found')));
    }
    return Project
      .remove({ _id: get(request, 'params.id', '') }).exec()
      .then(() =>
        Client.find({ projects: get(request, 'params.id', '') })
        .exec())
      .then(clients =>
        Promise.all(map(clients, client => {
          set(client, 'projects', remove(get(client, 'projects', []),
            project => isEqual(project(get(request, 'params.id', '')))));
          client.markModified('projects');
          return client.save();
        })))
      .then(() => reply('Deleted').code(ACCEPTED));
  })
  .catch(err => reply(badImplementation(err)));
