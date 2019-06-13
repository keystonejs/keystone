import React, { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput, Currency } from '@arch-ui/fields';
import { Input } from '@arch-ui/input';

export default class TextField extends Component {
  onChange = event => {
    const value = event.target.value;
    this.props.onChange(value.replace(/[^0-9.,]+/g, ''));
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
    const { autoFocus, field, value, errors } = this.props;
    const {
      // currency,
      // digits,
      symbol,
    } = field.config;
    const htmlID = `ks-input-${field.path}`;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
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
