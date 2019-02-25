// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';
import type { CellProps } from '@voussoir/admin-view/types';

type Props = CellProps<string>;

export const ColorCell = (props: Props) => {
  if (!props.data) {
    return null;
  }

  return (
    <React.Fragment>
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
    </React.Fragment>
  );
};
