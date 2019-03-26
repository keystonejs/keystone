/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import React from 'react';
import { createPortal } from 'react-dom';
import { Sparklines, SparklinesLine } from 'react-sparklines';

export default () => {
  return createPortal(
    <section
      css={css`
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translateY(-50%);
        padding: 2rem;
        border: 1px solid black;
        box-shadow: 0px 0px 100px -20px rgba(0, 0, 0, 0.8);
      `}
    >
      <h1>New Users Report</h1>
      <Sparklines data={[5, 10, 5, 20, 8, 15]}>
        <SparklinesLine color="#fa7e17" />
      </Sparklines>
    </section>,
    document.body
  );
};
