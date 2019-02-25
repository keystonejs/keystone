// @flow

import React, { Component } from 'react';
import { Input } from '@arch-ui/input';
import type { FilterProps } from '@voussoir/admin-view/types';

type Props = FilterProps<string>;

export class IntegerFilter extends Component<Props> {
  handleChange = (event: Object) => {
    const value = event.target.value;
    this.props.onChange(value.replace(/\D/g, ''));
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
