import React, { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '../common';
import { Input } from '../../primitives/forms';

export default class TextField extends Component {
  onChange = event => {
    const { field, onChange } = this.props;
    onChange(field, event.target.value);
  };
  render() {
    const { field, item } = this.props;
    return (
      <FieldContainer>
        <FieldLabel>{field.label}</FieldLabel>
        <FieldInput>
          <Input
            type="text"
            value={item[field.path]}
            onChange={this.onChange}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
