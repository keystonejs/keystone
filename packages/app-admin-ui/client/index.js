import React, { Suspense, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { ToastProvider } from 'react-toast-notifications';
import { Global } from '@emotion/core';

import { globalStyles } from '@arch-ui/theme';

import ApolloClient from './apolloClient';
import Nav from './components/Nav';
import ScrollToTop from './components/ScrollToTop';
import ConnectivityListener from './components/ConnectivityListener';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import PageLoading from './components/PageLoading';
import ToastContainer from './components/ToastContainer';
import { useAdminMeta } from './providers/AdminMeta';
import { HooksProvider } from './providers/Hooks';

import HomePage from './pages/Home';
import ListPage from './pages/List';
import ListNotFoundPage from './pages/ListNotFound';
import ItemPage from './pages/Item';
import InvalidRoutePage from './pages/InvalidRoute';
import SignoutPage from './pages/Signout';

export const KeystoneAdminUI = () => {
  let adminMeta = useAdminMeta();
  let { adminPath, signinPath, signoutPath, apiPath, pages, hooks } = adminMeta;

  const apolloClient = useMemo(() => new ApolloClient({ uri: apiPath }), [apiPath]);

  const routes = [
    ...pages
      .filter(page => typeof page.path === 'string')
      .map(page => {
        const Page = page.component;
        return {
          path: `${adminPath}/${page.path}`,
          component: () => {
            return <Page />;
          },
          exact: true,
        };
      }),
    {
      path: `${adminPath}`,
      component: () => <HomePage {...adminMeta} />,
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
        const list = adminMeta.getListByPath(listKey);
        return list ? (
          <Switch>
            <Route
              exact
              path={`${adminPath}/:list`}
              render={routeProps => (
                <ListPage key={listKey} list={list} adminMeta={adminMeta} routeProps={routeProps} />
              )}
            />
            ,
            <Route
              exact
              path={`${adminPath}/:list/:itemId`}
              render={({
                match: {
                  params: { itemId },
                },
              }) => (
                <ItemPage key={`${listKey}-${itemId}`} list={list} itemId={itemId} {...adminMeta} />
              )}
            />
            ,
            <Route render={() => <InvalidRoutePage {...adminMeta} />} />,
          </Switch>
        ) : (
          <ListNotFoundPage listKey={listKey} {...adminMeta} />
        );
      },
    },
  ];

  return (
    <HooksProvider value={hooks}>
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
                <Route exact path={signoutPath} render={() => <SignoutPage {...adminMeta} />} />
                <Route>
                  <ScrollToTop>
                    <Nav>
                      <Suspense fallback={<PageLoading />}>
                        <Switch>
                          {routes.map(route => {
                            return (
                              <Route
                                exact={route.exact ? true : false}
                                key={route.path}
                                path={route.path}
                                render={route.component}
                              />
                            );
                          })}
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
    <KeystoneAdminUI />
  </Suspense>,
  document.getElementById('app')
);
