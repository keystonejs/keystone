import React, { Suspense, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/react-hooks';
import { BrowserRouter, Redirect, Route, Switch, useParams } from 'react-router-dom';
import { ToastProvider } from 'react-toast-notifications';
import { Global } from '@emotion/core';

import { globalStyles } from '@arch-ui/theme';

import { initApolloClient } from './apolloClient';
import Nav from './components/Nav';
import ScrollToTop from './components/ScrollToTop';
import ConnectivityListener from './components/ConnectivityListener';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import PageLoading from './components/PageLoading';
import ToastContainer from './components/ToastContainer';

import { AdminMetaProvider, useAdminMeta } from './providers/AdminMeta';
import { ListMetaProvider, useListMeta } from './providers/ListMeta';
import { ListProvider } from './providers/List';
import { HooksProvider } from './providers/Hooks';

import HomePage from './pages/Home';
import ListPage from './pages/List';
import ListNotFoundPage from './pages/ListNotFound';
import ItemPage from './pages/Item';
import InvalidRoutePage from './pages/InvalidRoute';
import NoListsPage from './pages/NoLists';
import SignoutPage from './pages/Signout';

const HomePageWrapper = () => {
  const { listKeys } = useListMeta();

  if (listKeys.length === 0) {
    return <NoListsPage />;
  }

  return <HomePage />;
};

const ListPageWrapper = () => {
  const { getListByPath } = useListMeta();
  const { adminPath } = useAdminMeta();
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

  const customRoutes = [
    ...pages
      .filter(({ path }) => typeof path === 'string')
      .map(({ component: Page, config = {}, path }) => ({
        path: `${adminPath}/${path}`,
        children: <Page {...config} />,
      })),
  ];

  return (
    <ScrollToTop>
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
    </ScrollToTop>
  );
};

export const KeystoneAdminUI = () => {
  const { adminPath, signinPath, signoutPath, apiPath, hooks } = useAdminMeta();

  const apolloClient = useMemo(() => initApolloClient({ uri: apiPath }), [apiPath]);

  return (
    <ApolloProvider client={apolloClient}>
      <Global styles={globalStyles} />
      <ListMetaProvider>
        <HooksProvider hooks={hooks}>
          <KeyboardShortcuts>
            <ToastProvider components={{ ToastContainer }}>
              <ConnectivityListener />
              <BrowserRouter>
                <Switch>
                  <Route exact path={signinPath} children={<Redirect to={adminPath} />} />
                  <Route exact path={signoutPath} children={<SignoutPage />} />
                  <Route children={<MainPageWrapper />} />
                </Switch>
              </BrowserRouter>
            </ToastProvider>
          </KeyboardShortcuts>
        </HooksProvider>
      </ListMetaProvider>
    </ApolloProvider>
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
