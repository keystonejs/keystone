/* global KEYSTONE_ADMIN_META */

import React from 'react';

import List from '../classes/List';
import { views, readViews, preloadViews } from '../FIELD_TYPES';

const { __pages__: pageViews, __hooks__: hookView, ...listViews } = views;

// TODO: Pull this off `window.X` to support server side permission queries
const { lists, ...srcMeta } = KEYSTONE_ADMIN_META;

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
    let viewsToLoad = new Set();
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

    // we want to load all of the field controllers, views and hooks upfront so we don't have a waterfall of requests
    readViews([...viewsToLoad]);
    listKeys.forEach(key => {
      const list = new List(lists[key], adminMeta, views[key]);
      listsByKey[key] = list;
      listsByPath[list.path] = list;
    });
    hasInitialisedLists = true;
  }
  let hooks = {};
  if (typeof hookView === 'function') {
    [hooks] = readViews([hookView]);
  }
  const hookPages = hooks.pages ? hooks.pages() : [];
  const adminMataPages = adminMeta.pages ? adminMeta.pages : [];
  const pages = resolveCustomPages([...adminMataPages, ...hookPages]);
  return { ...adminMeta, hooks, pages };
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

// HOC Wrapper

function setDisplayName(c) {
  c.displayName = `withAdminMeta(${c.name || c.displayName})`;
}
export const withAdminMeta = Component => props => {
  setDisplayName(Component);
  // TODO: Permission query to see which lists to provide
  return <Component {...props} adminMeta={readAdminMeta()} />;
};
