// @flow

import React, { Component } from 'react';
import { Input } from '@voussoir/ui/src/primitives/forms';
import type { FilterProps } from '../../../types';

type TextFilterViewProps = FilterProps<string>;

export default class TextFilterView extends Component<TextFilterViewProps> {
  componentDidUpdate(prevProps: TextFilterViewProps) {
    const { filter } = this.props;

    if (prevProps.filter !== filter) {
      this.props.recalcHeight();
    }
  }
  handleChange = (event: *) => {
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
      <Input
        onChange={this.handleChange}
        innerRef={innerRef}
        placeholder={placeholder}
        value={value}
      />
    );
  }
}
