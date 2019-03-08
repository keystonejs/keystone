import React, { Fragment } from 'react';
import { Global } from '@emotion/core';
import { globalStyles } from '@arch-ui/theme';

import SignoutPage from '../client/pages/Signout';

export default () => (
  <Fragment>
    <Global styles={globalStyles} />
    <SignoutPage />
  </Fragment>
);
