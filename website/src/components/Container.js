/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx } from '@emotion/core';

export const Container = props => (
  <div
    css={{
      maxWidth: 1140,
      paddingLeft: 40,
      paddingRight: 40,
      marginLeft: 'auto',
      marginRight: 'auto',
    }}
    {...props}
  />
);
