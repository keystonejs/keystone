// @flow

import React, { Component } from 'react';
import { Input } from '@arch-ui/input';
import type { FilterProps } from '../../../types';

type Props = FilterProps<string>;

export default class TextFilterView extends Component<Props> {
  handleChange = (event: Object) => {
    const value = event.target.value;
    if (/^-?\d*\.?\d*$/.test(value)) {
      this.props.onChange(value);
    }
  };

  render() {
    const { filter, field, innerRef, value } = this.props;

    if (!filter) return null;

    const placeholder = field.getFilterLabel(filter);

    return (
      <Input onChange={this.handleChange} ref={innerRef} placeholder={placeholder} value={value} />
    );
  }
}
