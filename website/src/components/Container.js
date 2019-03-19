/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx } from '@emotion/core';
import { media } from '../utils/media';
import { gridSize } from '@arch-ui/theme';

export const CONTAINER_GUTTERS = [gridSize * 2, gridSize * 3, gridSize * 4];

export const Container = props => (
  <div
    css={{
      maxWidth: 1140,
      marginLeft: 'auto',
      marginRight: 'auto',

      [media.lg]: {
        paddingLeft: CONTAINER_GUTTERS[2],
        paddingRight: CONTAINER_GUTTERS[2],
      },
      [media.sm]: {
        paddingLeft: CONTAINER_GUTTERS[1],
        paddingRight: CONTAINER_GUTTERS[1],
      },
      [media.xs]: {
        paddingLeft: CONTAINER_GUTTERS[0],
        paddingRight: CONTAINER_GUTTERS[0],
      },
    }}
    {...props}
  />
);
