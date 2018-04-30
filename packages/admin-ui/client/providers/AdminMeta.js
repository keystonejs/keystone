/* global KEYSTONE_ADMIN_META */

import React from 'react';

import List from '../classes/List';

const sourceMeta = KEYSTONE_ADMIN_META;

const { lists } = sourceMeta;
const listKeys = Object.keys(lists);
const listsByPath = listKeys.reduce((map, key) => {
  const listConfig = lists[key];
  const list = new List(listConfig);
  // replace the config with the list instance
  lists[key] = list;
  // make the list available in the path map
  map[listConfig.path] = list;
  return map;
}, {});

const adminMeta = {
  ...sourceMeta,
  listKeys,
  getListByKey(key) {
    return lists[key];
  },
  getListByPath(path) {
    return listsByPath[path];
  },
};

// Provider

export default function AdminMetaProvider({ children }) {
  return children(adminMeta);
}

// HOC Wrapper

function enhanceDisplayName(c) {
  c.displayName = `withAdminMeta(${c.name || c.displayName})`;
}
export const withAdminMeta = Component => props => {
  enhanceDisplayName(Component);
  return <Component {...props} adminMeta={adminMeta} />;
};
