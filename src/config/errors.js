import { transform, set, join } from 'lodash';

export default transform({
  userNotFound: 'userNotFound',
  wrongPassword: 'wrongPassword',
  clientNotFound: 'clientNotFound',
  wrongToken: 'wrongToken',
  grantNotAuthorized: 'grantNotAuthorized'
}, (total, value, key) =>
  set(total, key, join(['ERROR', value], '.')), {});
