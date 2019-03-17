/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx } from '@emotion/core';
import { media } from '../utils/media';
import { gridSize } from '@arch-ui/theme';

export const Container = props => (
  <div
    css={{
      maxWidth: 1140,
      marginLeft: 'auto',
      marginRight: 'auto',

      [media.lg]: {
        paddingLeft: gridSize * 5,
        paddingRight: gridSize * 5,
      },
      [media.sm]: {
        paddingLeft: gridSize * 3,
        paddingRight: gridSize * 3,
      },
      [media.xs]: {
        paddingLeft: gridSize * 2,
        paddingRight: gridSize * 2,
      },
    }}
    {...props}
  />
);
