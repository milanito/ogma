import {
  reduce, get, clone, set
} from 'lodash';

export default (keys, pKeys) =>
  reduce(pKeys, (total, pKey) =>
    set(clone(total), pKey, get(keys, pKey, '')), {});
