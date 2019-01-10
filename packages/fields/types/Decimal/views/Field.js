import React, { Component } from 'react';

import {
  FieldContainer,
  FieldLabel,
  FieldInput,
  Currency,
} from '@arch-ui/fields';
import { Input } from '@arch-ui/input';

export default class TextField extends Component {
  onChange = event => {
    const { field, onChange } = this.props;
    const value = event.target.value;
    onChange(field, value.replace(/[^0-9.,]+/g, ''));
  };

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

  render() {
    const { autoFocus, field, item } = this.props;
    const {
      // currency,
      // digits,
      symbol,
    } = field.config;
    const value = item[field.path];
    const htmlID = `ks-input-${field.path}`;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID}>{field.label}</FieldLabel>
        <FieldInput>
          {symbol && <Currency>{symbol}</Currency>}
          <Input
            autoComplete="off"
            autoFocus={autoFocus}
            type="text"
            value={this.valueToString(value)}
            onChange={this.onChange}
            id={htmlID}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
