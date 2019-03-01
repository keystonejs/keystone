import React, { Suspense, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ToastProvider } from 'react-toast-notifications';
import { Global } from '@emotion/core';

import { globalStyles } from '@arch-ui/theme';

import ApolloClient from './apolloClient';

import Nav from './components/Nav';
import ScrollToTop from './components/ScrollToTop';
import ConnectivityListener from './components/ConnectivityListener';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import { useAdminMeta } from './providers/AdminMeta';

import HomePage from './pages/Home';
import ListPage from './pages/List';
import ListNotFoundPage from './pages/ListNotFound';
import ItemPage from './pages/Item';
import InvalidRoutePage from './pages/InvalidRoute';
import StyleGuidePage from './pages/StyleGuide';

const Keystone = () => {
  let adminMeta = useAdminMeta();
  let { adminPath, apiPath } = adminMeta;
  return (
    <ApolloProvider client={useMemo(() => new ApolloClient({ uri: apiPath }), [apiPath])}>
      <KeyboardShortcuts>
        <ToastProvider>
          <ConnectivityListener />
          <Global styles={globalStyles} />
          <BrowserRouter>
            <ScrollToTop>
              <Nav>
                <Switch>
                  <Route
                    path={`${adminPath}/style-guide/:page?`}
                    render={() => <StyleGuidePage {...adminMeta} />}
                  />
                  <Route exact path={`${adminPath}`} render={() => <HomePage {...adminMeta} />} />
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
                            render={() => <ListPage key={listKey} list={list} {...adminMeta} />}
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
              </Nav>
            </ScrollToTop>
          </BrowserRouter>
        </ToastProvider>
      </KeyboardShortcuts>
    </ApolloProvider>
  );
};

ReactDOM.render(
  <Suspense fallback={null}>
    <Keystone />
  </Suspense>,
  document.getElementById('app')
);
