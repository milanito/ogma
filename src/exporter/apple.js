import {
  join, map, get
} from 'lodash';

export default (keys, pKeys) =>
  join(map(pKeys, pKey =>
    join([
      `"${pKey}"`,
      `"${get(keys, pKey, '')}"`
    ], ' = ')), '\n');

