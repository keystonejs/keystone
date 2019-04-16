// @flow

import React, { Component } from 'react';
import type { CellProps } from '../../../types';

type Props = CellProps<boolean>;

export default class CheckboxCellView extends Component<Props> {
  render() {
    const { data } = this.props;
    return <input type="checkbox" checked={data} disabled />;
  }
}
