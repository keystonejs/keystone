/** @jsx jsx */

import { jsx } from '@emotion/core';
import * as React from 'react';

import Preview from './preview';

const Cell = ({ data }) => {
  if (!data) {
    return null;
  }

  return (
    <Preview data={data.preview} originalUrl={data.originalUrl} />
  );
};

export default Cell;
