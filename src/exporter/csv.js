import {
  reduce, join, isEmpty
} from 'lodash';

import flatjson from './flatjson';

export default (keys, pKeys) =>
  join(reduce(flatjson(keys, pKeys), (total, value, key) => {
    if (isEmpty(total)) {
      total.push('"Key","Translation"');
    }
    total.push(`"${key}","${value}"`);
    return total;
  }, []), '\n');

