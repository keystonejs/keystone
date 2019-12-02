import React, { Component } from 'react';
import { Input } from '@arch-ui/input';
export default class TextFilterView extends Component {
  valueToString = value => {
    // Make the value a string to prevent loss of accuracy and precision.
    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'number') {
      return String(value);
    } else {
      // If it is neither string nor number then it must be empty.
      return '';
    }
  };

  handleChange = event => {
    const value = event.target.value;
    this.props.onChange(value.replace(/[^0-9.,]+/g, ''));
  };

  render() {
    const { filter, field, innerRef, value } = this.props;

    if (!filter) return null;

    const placeholder = field.getFilterLabel(filter);

    return (
      <Input
        onChange={this.handleChange}
        ref={innerRef}
        placeholder={placeholder}
        value={this.valueToString(value)}
      />
    );
  }
}
