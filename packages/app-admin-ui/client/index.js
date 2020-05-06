import React, { Suspense, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/react-hooks';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
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
import { ListProvider } from './providers/List';
import { HooksProvider } from './providers/Hooks';

import HomePage from './pages/Home';
import ListPage from './pages/List';
import ListNotFoundPage from './pages/ListNotFound';
import ItemPage from './pages/Item';
import InvalidRoutePage from './pages/InvalidRoute';
import SignoutPage from './pages/Signout';

export const KeystoneAdminUI = () => {
  const {
    getListByPath,
    adminPath,
    signinPath,
    signoutPath,
    apiPath,
    pages,
    hooks,
  } = useAdminMeta();

  const apolloClient = useMemo(() => initApolloClient({ uri: apiPath }), [apiPath]);

  const routes = [
    ...pages
      .filter(page => typeof page.path === 'string')
      .map(page => {
        const Page = page.component;
        const config = page.config || {};
        return {
          path: `${adminPath}/${page.path}`,
          component: () => {
            return <Page {...config} />;
          },
          exact: true,
        };
      }),
    {
      path: `${adminPath}`,
      component: () => <HomePage />,
      exact: true,
    },
    {
      path: `${adminPath}/:listKey`,
      component: ({
        match: {
          params: { listKey },
        },
      }) => {
        // TODO: Permission query to show/hide a list from the
        // menu
        const list = getListByPath(listKey);
        if (!list) {
          return <ListNotFoundPage listKey={listKey} />;
        }

        return (
          <ListProvider key={listKey} list={list}>
            <Switch>
              <Route exact path={`${adminPath}/:list`} render={() => <ListPage key={listKey} />} />
              ,
              <Route
                exact
                path={`${adminPath}/:list/:itemId`}
                render={({
                  match: {
                    params: { itemId },
                  },
                }) => <ItemPage key={`${listKey}-${itemId}`} itemId={itemId} />}
              />
              ,
              <Route render={() => <InvalidRoutePage />} />,
            </Switch>
          </ListProvider>
        );
      },
    },
  ];

  return (
    <HooksProvider hooks={hooks}>
      <ApolloProvider client={apolloClient}>
        <KeyboardShortcuts>
          <ToastProvider components={{ ToastContainer }}>
            <ConnectivityListener />
            <Global styles={globalStyles} />
            <BrowserRouter>
              <Switch>
                <Route exact path={signinPath}>
                  <Redirect to={adminPath} />
                </Route>
                <Route exact path={signoutPath} render={() => <SignoutPage />} />
                <Route>
                  <ScrollToTop>
                    <Nav>
                      <Suspense fallback={<PageLoading />}>
                        <Switch>
                          {routes.map(route => (
                            <Route
                              exact={route.exact ? true : false}
                              key={route.path}
                              path={route.path}
                              render={route.component}
                            />
                          ))}
                        </Switch>
                      </Suspense>
                    </Nav>
                  </ScrollToTop>
                </Route>
              </Switch>
            </BrowserRouter>
          </ToastProvider>
        </KeyboardShortcuts>
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
