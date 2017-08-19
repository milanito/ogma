import {
  reduce, join, isEmpty
} from 'lodash';

import flatjson from './flatjson';

/**
 * This function exports a locale's keys in
 * CSV format
 * @param { Array } keys the locale's keys
 * @param { Array } pKeys the project's keys
 * @return { String } A XML string
 */
export default (keys, pKeys) =>
  join(reduce(flatjson(keys, pKeys), (total, value, key) => {
    if (isEmpty(total)) {
      total.push('"Key","Translation"');
    }
    total.push(`"${key}","${value}"`);
    return total;
  }, []), '\n');

