/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx } from '@emotion/core';
import { mq } from '../utils/media';
import { gridSize } from '@arch-ui/theme';

export const CONTAINER_GUTTERS = [gridSize * 2, gridSize * 3, gridSize * 4];
export const DEFAULT_WIDTH = 1440;

export const Container = ({ width = DEFAULT_WIDTH, ...props }) => (
  <div
    css={mq({
      boxSizing: 'border-box',
      marginLeft: 'auto',
      marginRight: 'auto',
      maxWidth: width,
      // paddingLeft: CONTAINER_GUTTERS,
      // paddingRight: CONTAINER_GUTTERS,
    })}
    {...props}
  />
);
