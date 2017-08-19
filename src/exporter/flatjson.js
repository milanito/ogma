import {
  reduce, get, merge, clone
} from 'lodash';

/**
 * This function exports a locale's keys in
 * flat json format, meaning that a key `some.key`
 * will be `some.key`
 * @param { Array } keys the locale's keys
 * @param { Array } pKeys the project's keys
 * @return { String } A XML string
 */
export default (keys, pKeys) =>
  reduce(pKeys, (total, pKey) => {
    const item = {};
    item[pKey] = get(keys, pKey, '');
    return merge(clone(total), item);
  }, {});
