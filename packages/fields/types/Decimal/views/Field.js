import React, { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput, Currency } from '@voussoir/ui/src/primitives/fields';
import { Input } from '@voussoir/ui/src/primitives/forms';

export default class TextField extends Component {
  onChange = event => {
    const { field, onChange } = this.props;
    const value = event.target.value;
    onChange(field, value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'));
    // if(/^\$?[0-9][0-9,]*[0-9]\.?[0-9]{0,2}$/.test(value)){
    //   onChange(field, value);
    // }
  };

  valueToString = value => {
    // Make the value a string to keep react happy.
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
            type="number"
            value={this.valueToString(value)}
            onChange={this.onChange}
            id={htmlID}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
