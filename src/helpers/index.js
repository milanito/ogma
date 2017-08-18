import {
  isEqual, merge
} from 'lodash';

export const projectsListQuery = ({ _id, role }, isEditor = false) => {
  const query = {};
  if (isEqual(role, 'user')) {
    merge(query, { 'users.user': _id });

    if (isEditor) {
      merge(query, { 'users.role': { $in: ['editor', 'owner'] } });
    }
  }

  return query;
};
