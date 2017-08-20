import Joi from 'joi';
import { forEach } from 'lodash';

import {
  authenticate
} from '../controllers/auth.controller';

/**
 * This function registers the server's routes
 * for user authentication
 * @param { Object } server the Hapi server
 * @param { Object } options the plugin options
 * @param { Function } next the Hapi next function
 * @return { Promise } a promise that resolves the
 * server
 */
const authRoutes = (server, options, next) => {
  forEach([{
    method: 'POST',
    path: '/',
    handler: authenticate,
    config: {
      auth: false,
      description: 'This route is used to authenticate the user',
      validate: {
        payload: Joi.object({
          grant: Joi.string().only(['user', 'client']).required().description('Grant type'),
          email: Joi.string().when('grant', {
            is: Joi.valid('user'),
            then: Joi.string().email().required(),
            otherwise: Joi.forbidden()
          }).description('User Email'),
          password: Joi.string().when('grant', {
            is: Joi.valid('user'),
            then: Joi.required(),
            otherwise: Joi.forbidden()
          }).description('User Password'),
          id: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i).when('grant', {
            is: Joi.valid('client'),
            then: Joi.required(),
            otherwise: Joi.forbidden()
          }).description('Client id'),
          token: Joi.string().when('grant', {
            is: Joi.valid('client'),
            then: Joi.required(),
            otherwise: Joi.forbidden()
          }).description('Client token')
        })
      },
      response: {
        status: {
          200: Joi.object().keys({ token: Joi.string() }),
          400: Joi.object().keys({
            statusCode: Joi.number(),
            error: Joi.string(),
            message: Joi.string()
          }),
          403: Joi.object().keys({
            statusCode: Joi.number(),
            error: Joi.string(),
            message: Joi.string()
          }),
          404: Joi.object().keys({
            statusCode: Joi.number(),
            error: Joi.string(),
            message: Joi.string()
          })
        }
      }
    }
  }], def => server.route(def));

  next();
};

authRoutes.attributes = {
  name: 'AuthRoutes'
};

export default authRoutes;

