/* global KEYSTONE_ADMIN_META */

import React from 'react';

import List from '../classes/List';

const { lists, ...srcMeta } = KEYSTONE_ADMIN_META;

const listKeys = Object.keys(lists || {});
const listsByKey = {};
const listsByPath = {};

const adminMeta = {
  ...srcMeta,
  listKeys,
  getListByKey(key) {
    return listsByKey[key];
  },
  getListByPath(path) {
    return listsByPath[path];
  },
};

listKeys.forEach(key => {
  const list = new List(lists[key], adminMeta);
  listsByKey[key] = list;
  listsByPath[list.path] = list;
});

// Provider

export default function AdminMetaProvider({ children }) {
  return children(adminMeta);
}

// HOC Wrapper

function setDisplayName(c) {
  c.displayName = `withAdminMeta(${c.name || c.displayName})`;
}
export const withAdminMeta = Component => props => {
  setDisplayName(Component);
  return <Component {...props} adminMeta={adminMeta} />;
};
