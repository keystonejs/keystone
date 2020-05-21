/* global KEYSTONE_ADMIN_META */

import List from '../classes/List';
import { views, readViews, preloadViews } from '../FIELD_TYPES';

import React, { useContext, createContext } from 'react';

const { __pages__: pageViews, __hooks__: hookView, ...listViews } = views;

// TODO: Pull this off `window.X` to support server side permission queries
const {
  adminPath,
  apiPath,
  graphiqlPath,
  pages,
  hooks,
  signinPath,
  signoutPath,
  authStrategy,
  lists,
  name,
  ...customMeta
} = KEYSTONE_ADMIN_META;

const AdminMetaContext = createContext();

const resolveCustomPages = pages => {
  if (!Array.isArray(pages)) return pages;

  pages.forEach(page => {
    if (typeof page.component === 'string') {
      // this can be simplified once all pages are hooks
      const [Page] = readViews([pageViews[page.path]]);
      page.component = Page;
    }
    if (page.children) {
      page.children = resolveCustomPages(page.children);
    }
  });

  return pages;
};

export const AdminMetaProvider = ({ children }) => {
  // TODO: Permission query to see which lists to provide
  const listsByKey = {};
  const listsByPath = {};
  const getListByKey = key => listsByKey[key];

  const viewsToLoad = new Set();
  if (typeof hookView === 'function') {
    viewsToLoad.add(hookView);
  }

  Object.values(pageViews).forEach(view => {
    viewsToLoad.add(view);
  });

  Object.values(listViews).forEach(list => {
    Object.values(list).forEach(({ Controller }) => {
      viewsToLoad.add(Controller);
    });
  });

  // We want to load all of the field controllers, views and hooks upfront
  // so we don't have a waterfall of requests
  readViews([...viewsToLoad]);

  Object.entries(lists || {}).forEach(
    ([key, { access, adminConfig, adminDoc, fields, gqlNames, label, path, plural, singular }]) => {
      const list = new List(
        { access, adminConfig, adminDoc, fields, gqlNames, key, label, path, plural, singular },
        { readViews, preloadViews, getListByKey, apiPath, adminPath },
        views[key]
      );
      listsByKey[key] = list;
      listsByPath[list.path] = list;
    }
  );

  const listKeys = Object.values(listsByKey)
    .sort(({ label: a }, { label: b }) => a.localeCompare(b)) // TODO: locale options once intl support is added
    .map(({ key }) => key);

  let hookViews = {};
  if (typeof hookView === 'function') {
    [hookViews] = readViews([hookView]);
  }

  const hookPages = hookViews.pages ? hookViews.pages() : [];
  const adminMetaPages = pages || [];

  const value = {
    adminPath,
    apiPath,
    graphiqlPath,
    signinPath,
    signoutPath,
    authStrategy,
    name,
    listKeys,
    getListByKey,
    getListByPath: path => listsByPath[path],
    hooks: hookViews,
    pages: resolveCustomPages([...adminMetaPages, ...hookPages]),
    ...customMeta,
  };

  return <AdminMetaContext.Provider value={value}>{children}</AdminMetaContext.Provider>;
};

export const useAdminMeta = () => useContext(AdminMetaContext);
