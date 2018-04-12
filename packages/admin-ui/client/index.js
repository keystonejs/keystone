import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { injectGlobal } from 'emotion';

import globalStyles from '@keystone/ui/src/globalStyles';
injectGlobal(globalStyles);

import ScrollToTop from './components/ScrollToTop';
import AdminMetaProvider from './providers/AdminMeta';
import apolloClient from './providers/apolloClient';

import HomePage from './pages/Home';
import SessionPage from './pages/Session';
import ListPage from './pages/List';
import ListNotFoundPage from './pages/ListNotFound';
import ItemPage from './pages/Item';
import InvalidRoutePage from './pages/InvalidRoute';

const Keystone = () => (
  <ApolloProvider client={apolloClient}>
    <AdminMetaProvider>
      {adminMeta => (
        <BrowserRouter>
          <ScrollToTop>
            <Switch>
              <Route
                exact
                path="/admin/signin"
                render={() => <SessionPage {...adminMeta} />}
              />
              <Route
                exact
                path="/admin"
                render={() => <HomePage {...adminMeta} />}
              />
              <Route
                path="/admin/:listKey"
                render={({ match: { params: { listKey } } }) => {
                  const list = adminMeta.getListByPath(listKey);
                  return list ? (
                    <Switch>
                      <Route
                        exact
                        path="/admin/:list"
                        render={() => <ListPage list={list} {...adminMeta} />}
                      />
                      <Route
                        exact
                        path="/admin/:list/:itemId"
                        render={({ match: { params: { itemId } } }) => (
                          <ItemPage
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
      )}
    </AdminMetaProvider>
  </ApolloProvider>
);

ReactDOM.render(<Keystone />, document.getElementById('app'));
