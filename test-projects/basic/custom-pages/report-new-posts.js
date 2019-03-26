/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import React from 'react';
import { Sparklines, SparklinesLine } from 'react-sparklines';

export default () => {
  return (
    <section css={css`margin: 2rem;`}>
      <h1>New Posts Report</h1>
      <Sparklines data={[5, 10, 5, 20, 8, 15]}>
        <SparklinesLine />
      </Sparklines>
    </section>
  );
};
