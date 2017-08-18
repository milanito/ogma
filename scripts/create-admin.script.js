import database from '../src/database';
import User from '../src/database/models/user.model';

import { adminUser } from './seed';

database()
.then(() => User.create(adminUser))
.then(user => console.log(`User created with id : ${user._id}`))
.then(() => process.exit(0))
.catch(err => console.log(err));
