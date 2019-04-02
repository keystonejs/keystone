/* eslint-disable import/no-extraneous-dependencies */
// @flow

import type { CellProps } from '../../../../types';
import * as React from 'react';

const stripHttpPattern = /^https?\:\/\//i;

type Props = CellProps<string>;

const Cell = (props: Props) => {
  let { data } = props;

  if (!data) {
    return null;
  }

  // if the value doesn't start with a protocol, assume http for the protocol
  // it doesn't include // in the check to account for protocols like mailto:, tel: and etc.
  if (!/^\w+\:/.test(data)) {
    data = 'http://' + data;
  }

  const label = data.replace(stripHttpPattern, '');

  return <a href={data}>{label}</a>;
};

export default Cell;
