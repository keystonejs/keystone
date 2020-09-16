import React, { Suspense, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter, Redirect, Route, Switch, useParams } from 'react-router-dom';
import { ToastProvider } from 'react-toast-notifications';
import { Global } from '@emotion/core';

import { globalStyles } from '@arch-ui/theme';

import { initApolloClient } from './apolloClient';
import Nav from './components/Nav';
import PageLoading from './components/PageLoading';
import ToastContainer from './components/ToastContainer';

import { useConnectivityListener } from './hooks/ConnectivityListener';
import { useScrollToTop } from './hooks/ScrollToTop';

import { AdminMetaProvider, useAdminMeta } from './providers/AdminMeta';
import { ListProvider } from './providers/List';
import { HooksProvider } from './providers/Hooks';
import { KeyboardShortcutsProvider } from './providers/KeyboardShortcuts';

import HomePage from './pages/Home';
import ListPage from './pages/List';
import ListNotFoundPage from './pages/ListNotFound';
import ItemPage from './pages/Item';
import InvalidRoutePage from './pages/InvalidRoute';
import NoListsPage from './pages/NoLists';
import SignoutPage from './pages/Signout';

const HomePageWrapper = () => {
  const { listKeys } = useAdminMeta();

  if (listKeys.length === 0) {
    return <NoListsPage />;
  }

  return <HomePage />;
};

const ListPageWrapper = () => {
  const { getListByPath, adminPath } = useAdminMeta();
  const { listKey } = useParams();

  // TODO: Permission query to show/hide a list from the menu
  const list = getListByPath(listKey);
  if (!list) {
    return <ListNotFoundPage listKey={listKey} />;
  }

  return (
    <ListProvider key={listKey} list={list}>
      <Switch>
        <Route exact path={`${adminPath}/:list`} children={<ListPage />} />
        <Route exact path={`${adminPath}/:list/:itemId`} children={<ItemPage />} />
        <Route children={<InvalidRoutePage />} />,
      </Switch>
    </ListProvider>
  );
};

const MainPageWrapper = () => {
  const { adminPath, pages } = useAdminMeta();

  useConnectivityListener();
  useScrollToTop();

  const customRoutes = [
    ...pages
      .filter(({ path }) => typeof path === 'string')
      .map(({ component: Page, config = {}, path }) => ({
        path: `${adminPath}/${path}`,
        children: <Page {...config} />,
      })),
  ];

  return (
    <Nav>
      <Suspense fallback={<PageLoading />}>
        <Switch>
          {customRoutes.map(({ path, children }) => (
            <Route exact key={path} path={path} children={children} />
          ))}
          <Route exact path={adminPath} children={<HomePageWrapper />} />
          <Route path={`${adminPath}/:listKey`} children={<ListPageWrapper />} />
        </Switch>
      </Suspense>
    </Nav>
  );
};

export const KeystoneAdminUI = () => {
  const { adminPath, signinPath, signoutPath, apiPath, hooks } = useAdminMeta();

  const apolloClient = useMemo(() => initApolloClient({ uri: apiPath }), [apiPath]);

  return (
    <HooksProvider hooks={hooks}>
      <ApolloProvider client={apolloClient}>
        <KeyboardShortcutsProvider>
          <ToastProvider components={{ ToastContainer }}>
            <Global styles={globalStyles} />
            <BrowserRouter>
              <Switch>
                <Route exact path={signinPath} children={<Redirect to={adminPath} />} />
                <Route exact path={signoutPath} children={<SignoutPage />} />
                <Route children={<MainPageWrapper />} />
              </Switch>
            </BrowserRouter>
          </ToastProvider>
        </KeyboardShortcutsProvider>
      </ApolloProvider>
    </HooksProvider>
  );
};

ReactDOM.render(
  <Suspense fallback={null}>
    <AdminMetaProvider>
      <KeystoneAdminUI />
    </AdminMetaProvider>
  </Suspense>,
  document.getElementById('app')
);
