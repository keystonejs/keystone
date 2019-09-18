// @flow
/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import type { CellProps } from '../../../types';

type Props = CellProps<string>;

const Cell = (props: Props) => {
  if (!props.data) {
    return null;
  }

  return (
    <Fragment>
      <div
        style={{
          // using inline styles instead of emotion for setting the color
          // since emotion doesn't escape styles so it could be used for CSS injection
          backgroundColor: props.data,
        }}
        css={{
          borderRadius: 3,
          display: 'inline-block',
          height: 18,
          width: 18,
          marginRight: 10,
          verticalAlign: 'middle',
        }}
      />
      <span
        css={{
          verticalAlign: 'middle',
        }}
      >
        {props.data}
      </span>
    </Fragment>
  );
};

export default Cell;
