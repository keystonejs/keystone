// @flow
/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Fragment, useMemo } from 'react';
import type { CellProps } from '../../../types';

type Props = CellProps<string>;

const Cell = (props: Props) => {
  const cellValue = useMemo(() => {
    if (!props.data) {
      return null;
    }
    try {
      const parsedValue = JSON.parse(props.data);
      const { r, g, b, a } = parsedValue.rgba;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    } catch (e) {
      return props.data;
    }
  }, [props.data]);

  return (
    <Fragment>
      <div
        style={{
          // using inline styles instead of emotion for setting the color
          // since emotion doesn't escape styles so it could be used for CSS injection
          backgroundColor: cellValue,
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
        {cellValue}
      </span>
    </Fragment>
  );
};

export default Cell;
