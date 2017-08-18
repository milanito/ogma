import {
  join, map
} from 'lodash';

import flatjson from './flatjson';

export default (keys, pKeys) =>
  join([
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<resources>',
    join(map(flatjson(keys, pKeys),
      (value, key) => `<string name="${key}">${value}</string>`),
    '\n'),
    '</resources>'
  ], '\n');
