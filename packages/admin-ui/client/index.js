import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { injectGlobal } from 'emotion';

import globalStyles from '@keystonejs/ui/src/globalStyles';
import { ToastProvider } from '@keystonejs/ui/src/primitives/toasts';
injectGlobal(globalStyles);

import ScrollToTop from './components/ScrollToTop';
import OfflineListener from './components/OfflineListener';
import AdminMetaProvider from './providers/AdminMeta';
import apolloClient from './providers/apolloClient';

import HomePage from './pages/Home';
import ListPage from './pages/List';
import ListNotFoundPage from './pages/ListNotFound';
import ItemPage from './pages/Item';
import InvalidRoutePage from './pages/InvalidRoute';
import StyleGuidePage from './pages/StyleGuide';

const Keystone = () => (
  <ApolloProvider client={apolloClient}>
    <ToastProvider>
      <OfflineListener />
      <AdminMetaProvider>
        {adminMeta => {
          const { adminPath } = adminMeta;
          return (
            <BrowserRouter>
              <ScrollToTop>
                <Switch>
                  <Route
                    path={`${adminPath}/style-guide/:page?`}
                    render={() => <StyleGuidePage {...adminMeta} />}
                  />
                  <Route
                    exact
                    path={`${adminPath}`}
                    render={() => <HomePage {...adminMeta} />}
                  />
                  <Route
                    path={`${adminPath}/:listKey`}
                    render={({
                      match: {
                        params: { listKey },
                      },
                    }) => {
                      const list = adminMeta.getListByPath(listKey);
                      return list ? (
                        <Switch>
                          <Route
                            exact
                            path={`${adminPath}/:list`}
                            render={() => (
                              <ListPage
                                key={listKey}
                                list={list}
                                {...adminMeta}
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
                          <Route
                            render={() => <InvalidRoutePage {...adminMeta} />}
                          />
                        </Switch>
                      ) : (
                        <ListNotFoundPage listKey={listKey} {...adminMeta} />
                      );
                    }}
                  />
                </Switch>
              </ScrollToTop>
            </BrowserRouter>
          );
        }}
      </AdminMetaProvider>
    </ToastProvider>
  </ApolloProvider>
);

ReactDOM.render(<Keystone />, document.getElementById('app'));
