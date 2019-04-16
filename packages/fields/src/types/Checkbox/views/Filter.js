// @flow

import React, { Component } from 'react';
import type { FilterProps } from '../../../types';

type Props = FilterProps<'true' | 'false' | 'null'>;

export default class CheckboxFilterView extends Component<Props> {
  handleChange = ({ target: { value } }: Object) => {
    this.props.onChange(value);
  };

  render() {
    const { filter, innerRef, value } = this.props;
    if (!filter) return null;

    return (
      <select onChange={this.handleChange} ref={innerRef} value={value}>
        <option value="true">Checked</option>
        <option value="false">Unchecked</option>
        <option value="null">Not set</option>
      </select>
    );
  }
}
