import {
  reduce, get, clone, set
} from 'lodash';

/**
 * This function exports a locale's keys in
 * json format, meaning that a key `some.key`
 * will be in an object `some` with a key `key`
 * @param { Array } keys the locale's keys
 * @param { Array } pKeys the project's keys
 * @return { String } A XML string
 */
export default (keys, pKeys) =>
  reduce(pKeys, (total, pKey) =>
    set(clone(total), pKey, get(keys, pKey, '')), {});
