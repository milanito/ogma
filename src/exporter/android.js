import {
  join, map
} from 'lodash';

import flatjson from './flatjson';

/**
 * This function exports a locale's keys in
 * android XML format
 * @param { Array } keys the locale's keys
 * @param { Array } pKeys the project's keys
 * @return { String } A XML string
 */
export default (keys, pKeys) =>
  join([
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<resources>',
    join(map(flatjson(keys, pKeys),
      (value, key) => `<string name="${key}">${value}</string>`),
    '\n'),
    '</resources>'
  ], '\n');
