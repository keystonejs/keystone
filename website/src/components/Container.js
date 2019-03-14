/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx } from '@emotion/core';
import { media } from '../utils/media';

export const Container = props => (
  <div
    css={{
      maxWidth: 1140,
      marginLeft: 'auto',
      marginRight: 'auto',

      [media.lg]: {
        paddingLeft: 40,
        paddingRight: 40,
      },
      [media.sm]: {
        paddingLeft: 20,
        paddingRight: 20,
      },
      [media.xs]: {
        paddingLeft: 10,
        paddingRight: 10,
      },
    }}
    {...props}
  />
);
