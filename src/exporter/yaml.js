import yamljs from 'yamljs';

import json from './json';

/**
 * This function exports a locale's keys in
 * YAML format
 * @param { Array } keys the locale's keys
 * @param { Array } pKeys the project's keys
 * @return { String } A YAML string
 */
export default (keys, pKeys) =>
  yamljs.stringify(json(keys, pKeys), 4);
