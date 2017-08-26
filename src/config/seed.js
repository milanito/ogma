import { isNull } from 'lodash';
import User from '../database/models/user.model';

/**
 * This function will seed an admin user if asked
 * by setting the `ADMIN_USER` variable to true
 * It will check if the user exists and create it
 * if not
 * @returns { Boolean|Promise } a boolean if no user
 * is needed, a promise otherwise
 */
export default () =>
  User.findOne({
    email: process.env.ADMIN_EMAIL || 'test@test.com',
  })
  .exec()
  .then(user => {
    if (isNull(user)) {
      console.log('Creating Admin User');
      return User.create({
        email: process.env.ADMIN_EMAIL || 'test@test.com',
        password: process.env.ADMIN_PASSWORD || 'admin',
        role: 'admin',
        username: 'admin'
      });
    }
    console.log('User already exists, skipping');
    return true;
  });
