// @flow

import { Component } from 'react';
import type { CellProps } from '../../../types';

type Props = CellProps<boolean>;

export default class CheckboxCellView extends Component<Props> {
  render() {
    const { data } = this.props;
    if (data === true) return 'Checked';
    if (data === false) return 'Unchecked';
    return 'Not set';
  }
}
