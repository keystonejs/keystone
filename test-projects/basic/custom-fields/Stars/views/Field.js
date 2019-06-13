import React from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import Stars from './Stars';

export default class StarsField extends React.Component {
  handleChange = newValue => {
    this.props.onChange(newValue);
  };

  render() {
    const { field, value, errors } = this.props;
    const { starCount } = field.config;
    const htmlID = `ks-input-${field.path}`;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
        <FieldInput>
          <Stars count={starCount} value={value} onChange={this.handleChange} />
        </FieldInput>
      </FieldContainer>
    );
  }
}
