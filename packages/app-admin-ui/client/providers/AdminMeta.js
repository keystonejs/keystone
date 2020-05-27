/* global KEYSTONE_ADMIN_META */

import { views, readViews } from '../FIELD_TYPES';

import React, { useContext, createContext } from 'react';

const { __pages__: pageViews, __hooks__: hookView, ...listViews } = views;

const {
  adminPath,
  apiPath,
  graphiqlPath,
  pages,
  hooks,
  signinPath,
  signoutPath,
  authStrategy,
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
    hooks: hookViews,
    pages: resolveCustomPages([...adminMetaPages, ...hookPages]),
    ...customMeta,
  };

  return <AdminMetaContext.Provider value={value}>{children}</AdminMetaContext.Provider>;
};

export const useAdminMeta = () => useContext(AdminMetaContext);
