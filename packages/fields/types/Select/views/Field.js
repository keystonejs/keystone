import React, { Component } from 'react';

import {
  FieldContainer,
  FieldLabel,
  FieldInput,
} from '@keystonejs/ui/src/primitives/fields';

import { Select } from '@keystonejs/ui/src/primitives/forms';

export default class SelectField extends Component {
  onChange = option => {
    const { field, onChange } = this.props;
    onChange(field, option ? option.value : null);
  };
  render() {
    const { autoFocus, field, item } = this.props;
    const value = field.options.filter(i => i.value === item[field.path])[0];
    return (
      <FieldContainer>
        <FieldLabel>{field.label}</FieldLabel>
        <FieldInput>
          <Select
            autoFocus={autoFocus}
            value={value}
            options={field.options}
            onChange={this.onChange}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
