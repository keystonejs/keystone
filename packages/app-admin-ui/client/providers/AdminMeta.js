/* global KEYSTONE_ADMIN_META */

import List from '../classes/List';
import { views, readViews, preloadViews } from '../FIELD_TYPES';

import React, { useContext, createContext } from 'react';

const { __pages__: pageViews, __hooks__: hookView, ...listViews } = views;

// TODO: Pull this off `window.X` to support server side permission queries
const { lists, ...srcMeta } = KEYSTONE_ADMIN_META;

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

  const adminMeta = {
    ...srcMeta,
    listKeys: Object.keys(lists || {}),
    getListByKey: key => listsByKey[key],
    getListByPath: path => listsByPath[path],
    readViews,
    preloadViews,
  };

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
        adminMeta,
        views[key]
      );
      listsByKey[key] = list;
      listsByPath[list.path] = list;
    }
  );

  let hooks = {};
  if (typeof hookView === 'function') {
    [hooks] = readViews([hookView]);
  }

  const hookPages = hooks.pages ? hooks.pages() : [];
  const adminMetaPages = adminMeta.pages ? adminMeta.pages : [];

  const pages = resolveCustomPages([...adminMetaPages, ...hookPages]);

  const value = {
    ...adminMeta,
    hooks,
    pages,
  };

  return <AdminMetaContext.Provider value={value}>{children}</AdminMetaContext.Provider>;
};

export const useAdminMeta = () => {
  return useContext(AdminMetaContext);
};
