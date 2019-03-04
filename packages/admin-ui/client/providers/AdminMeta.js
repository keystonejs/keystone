/* global KEYSTONE_ADMIN_META */

import React from 'react';

import List from '../classes/List';

// TODO: Pull this off `window.X` to support server side permission queries
const { lists, ...srcMeta } = KEYSTONE_ADMIN_META;

const listKeys = Object.keys(lists || {});
const listsByKey = {};
const listsByPath = {};

export const adminMeta = {
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
// TODO: Permission query to see which lists to provide
export const AdminMetaProvider = ({ children }) => children(adminMeta);

// why are we using a hook rather just exporting the adminMeta?
// so that we can add more logic later like reading the adminMeta from context so
// we can do a permission query
export const useAdminMeta = () => {
  return adminMeta;
};

// HOC Wrapper

function setDisplayName(c) {
  c.displayName = `withAdminMeta(${c.name || c.displayName})`;
}
export const withAdminMeta = Component => props => {
  setDisplayName(Component);
  // TODO: Permission query to see which lists to provide
  return <Component {...props} adminMeta={adminMeta} />;
};
