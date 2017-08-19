import {
  join, map, get
} from 'lodash';

/**
 * This function exports a locale's keys in
 * apple format
 * @param { Array } keys the locale's keys
 * @param { Array } pKeys the project's keys
 * @return { String } A XML string
 */
export default (keys, pKeys) =>
  join(map(pKeys, pKey =>
    join([
      `"${pKey}"`,
      `"${get(keys, pKey, '')}"`
    ], ' = ')), '\n');

