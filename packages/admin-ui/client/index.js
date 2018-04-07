import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import './primitives/globalStyles';

import ScrollToTop from './components/ScrollToTop';

import HomePage from './pages/Home';
import SessionPage from './pages/Session';
import ListPage from './pages/List';
import ItemPage from './pages/Item';

const Keystone = () => (
  <BrowserRouter>
    <ScrollToTop>
      <Switch>
        <Route exact path="/admin" component={HomePage} />
        <Route exact path="/admin/signin" component={SessionPage} />
        <Route exact path="/admin/:list" component={ListPage} />
        <Route exact path="/admin/:list/:itemId" component={ItemPage} />
      </Switch>
    </ScrollToTop>
  </BrowserRouter>
);

ReactDOM.render(<Keystone />, document.getElementById('app'));
