/* global KEYSTONE_ADMIN_META */

import React, { Fragment } from 'react';

import List from '../classes/List';
import { views, readViews, preloadViews } from '../FIELD_TYPES';

const { __pages__: pageViews, __hooks__: hookViews, ...listViews } = views;

// TODO: Pull this off `window.X` to support server side permission queries
const { lists, ...srcMeta } = KEYSTONE_ADMIN_META;

const listKeys = Object.keys(lists || {});
const listsByKey = {};
const listsByPath = {};

let hasInitialisedLists = false;

const adminMeta = {
  ...srcMeta,
  listKeys,
  getListByKey(key) {
    return listsByKey[key];
  },
  getListByPath(path) {
    return listsByPath[path];
  },
  pageViews,
  hookViews,
  readViews,
  preloadViews,
};

// it's important to note that List could throw a promise in it's constructor
// technically List should never actually throw a promise since the views that
// it needs are preloaded before the Lists are initialised
// but from an API perspective, it should be seen as if List could throw in it's constructor
// so this function should only be called inside a react render
function readAdminMeta() {
  if (!hasInitialisedLists) {
    let allControllers = new Set();

    Object.values(listViews).forEach(list => {
      Object.values(list).forEach(({ Controller }) => {
        allControllers.add(Controller);
      });
    });

    // we want to load all of the field controllers upfront so we don't have a waterfall of requests
    readViews([...allControllers]);
    listKeys.forEach(key => {
      const list = new List(lists[key], adminMeta, views[key]);
      listsByKey[key] = list;
      listsByPath[list.path] = list;
    });
    hasInitialisedLists = true;
  }
  return adminMeta;
}

// Provider
// TODO: Permission query to see which lists to provide
export const AdminMetaProvider = ({ children }) => children(readAdminMeta());

// why are we using a hook rather just exporting the adminMeta?
// so that we can add more logic later like reading the adminMeta from context so
// we can do a permission query
export const useAdminMeta = () => {
  return readAdminMeta();
};

// Hooks are functions that take an array of React components and a data object
// They can append, prepend or modify the array but cannot modify the hook data
// They must return an array of React components
export const resolveAdminUIHooks = (originalHook, newHook, hookData) => (...params) => {
  let resolvedData = params;
  if (originalHook) {
    resolvedData = originalHook(params, { ...hookData });
  }
  return newHook([...resolvedData], hookData);
};

export const useHook = (hookName, hookData = {}) => {
  const adminMeta = readAdminMeta();
  if (adminMeta.hookViews && adminMeta.hookViews[hookName]) {
    const resolvedHook = readViews(adminMeta.hookViews[hookName]).reduce(
      (prev, next) => resolveAdminUIHooks(prev, next, hookData),
      null
    );
    return c => resolvedHook(c).map((c, i) => <Fragment key={`${hookName}-${i}`}>{c}</Fragment>);
  } else {
    return c => c; // return component unchanged
  }
};

// HOC Wrapper

function setDisplayName(c) {
  c.displayName = `withAdminMeta(${c.name || c.displayName})`;
}
export const withAdminMeta = Component => props => {
  setDisplayName(Component);
  // TODO: Permission query to see which lists to provide
  return <Component {...props} adminMeta={readAdminMeta()} />;
};
