// @flow
import React, { Component } from 'react';
import type { CellProps } from '@voussoir/admin-view/types';

type Props = CellProps<boolean>;

export class CheckboxCell extends Component<Props> {
  render() {
    const { data } = this.props;
    return <input type="checkbox" checked={data} disabled />;
  }
}
