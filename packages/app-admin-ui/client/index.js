import React, { Suspense, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks'; // FIXME: Use the provided API when hooks ready
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

import HomePage from './pages/Home';
import ListPage from './pages/List';
import ListNotFoundPage from './pages/ListNotFound';
import ItemPage from './pages/Item';
import InvalidRoutePage from './pages/InvalidRoute';
import SignoutPage from './pages/Signout';

const findCustomPages = (pages, allPages = []) => {
  if (!Array.isArray(pages)) return allPages;
  pages.forEach(page => {
    if (typeof page.path === 'string') allPages.push(page);
    else if (page.children) findCustomPages(page.children, allPages);
  });
  return allPages;
};

const Keystone = () => {
  let adminMeta = useAdminMeta();
  let { adminPath, signinPath, signoutPath, apiPath, pages, pageViews, readViews } = adminMeta;
  const apolloClient = useMemo(() => new ApolloClient({ uri: apiPath }), [apiPath]);

  return (
    <ApolloProvider client={apolloClient}>
      <ApolloHooksProvider client={apolloClient}>
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
                          {findCustomPages(pages).map(page => (
                            <Route
                              exact
                              key={page.path}
                              path={`${adminPath}/${page.path}`}
                              render={() => {
                                const [Page] = readViews([pageViews[page.path]]);
                                return <Page />;
                              }}
                            />
                          ))}
                          <Route
                            exact
                            path={adminPath}
                            render={() => <HomePage {...adminMeta} />}
                          />
                          <Route
                            path={`${adminPath}/:listKey`}
                            render={({
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
                                      <ListPage
                                        key={listKey}
                                        list={list}
                                        adminMeta={adminMeta}
                                        routeProps={routeProps}
                                      />
                                    )}
                                  />
                                  <Route
                                    exact
                                    path={`${adminPath}/:list/:itemId`}
                                    render={({
                                      match: {
                                        params: { itemId },
                                      },
                                    }) => (
                                      <ItemPage
                                        key={`${listKey}-${itemId}`}
                                        list={list}
                                        itemId={itemId}
                                        {...adminMeta}
                                      />
                                    )}
                                  />
                                  <Route render={() => <InvalidRoutePage {...adminMeta} />} />
                                </Switch>
                              ) : (
                                <ListNotFoundPage listKey={listKey} {...adminMeta} />
                              );
                            }}
                          />
                        </Switch>
                      </Suspense>
                    </Nav>
                  </ScrollToTop>
                </Route>
              </Switch>
            </BrowserRouter>
          </ToastProvider>
        </KeyboardShortcuts>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};

ReactDOM.render(
  <Suspense fallback={null}>
    <Keystone />
  </Suspense>,
  document.getElementById('app')
);
