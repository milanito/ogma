import {
  reduce, get, merge, clone
} from 'lodash';

export default (keys, pKeys) =>
  reduce(pKeys, (total, pKey) => {
    const item = {};
    item[pKey] = get(keys, pKey, '');
    return merge(clone(total), item);
  }, {});
