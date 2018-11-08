import React from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@voussoir/ui/src/primitives/fields';
import Stars from './Stars';

export default class StarsField extends React.Component {
  handleChange = newValue => {
    const { field, onChange } = this.props;
    onChange(field, newValue);
  };

  render() {
    const { field, item } = this.props;
    const { starCount } = field.config;
    const value = item[field.path];
    const htmlID = `ks-input-${field.path}`;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID}>{field.label}</FieldLabel>
        <FieldInput>
          <Stars count={starCount} value={value} onClick={this.handleChange} />
        </FieldInput>
      </FieldContainer>
    );
  }
}
