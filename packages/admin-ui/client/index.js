/* eslint-disable no-unused-expressions */

import React from 'react';
import ReactDOM from 'react-dom';
import { injectGlobal } from 'emotion';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import HomePage from './pages/Home';
import ListPage from './pages/List';
import ItemPage from './pages/Item';

injectGlobal`
  * {
    box-sizing: border-box;
  }
  body {
    font-family: sans-serif;
  }
`;

const Keystone = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path="/admin" component={HomePage} />
      <Route exact path="/admin/:list" component={ListPage} />
      <Route exact path="/admin/:list/:itemId" component={ItemPage} />
    </Switch>
  </BrowserRouter>
);

ReactDOM.render(<Keystone />, document.getElementById('app'));
