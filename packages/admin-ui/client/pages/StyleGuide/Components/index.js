import React, { Fragment } from 'react';

import Alerts from './Alerts';
import Badges from './Badges';
import Buttons from './Buttons';
import Fields from './Fields';
import Grid from './Grid';
import Layout from './Layout';
import Loading from './Loading';
import Lozenges from './Lozenges';
import Modals from './Modals';
import Pagination from './Pagination';
import Pills from './Pills';

const ComponentsGuide = () => (
  <Fragment>
    <Pagination />
    <Badges />
    <Lozenges />
    <Pills />
    <Buttons />
    <Modals />
    <Fields />
    <Layout />
    <Loading />
    <Alerts />
    <Grid />
  </Fragment>
);
export default ComponentsGuide;
