import React, { Component } from 'react';
import Select from 'react-select';

import { FieldContainer, FieldLabel, FieldInput } from '../common';

export default class SelectField extends Component {
  onChange = option => {
    const { field, onChange } = this.props;
    onChange(field, option.value);
  };
  render() {
    const { field, item } = this.props;
    const value = field.options.filter(i => i.value === item[field.path])[0];
    return (
      <FieldContainer>
        <FieldLabel>{field.label}</FieldLabel>
        <FieldInput>
          <Select
            value={value}
            options={field.options}
            onChange={this.onChange}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
