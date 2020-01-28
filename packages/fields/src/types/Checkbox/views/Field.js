/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component } from 'react';

import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';

import { CheckboxPrimitive } from '@arch-ui/controls';

export default class TextField extends Component {
  onChange = event => {
    this.props.onChange(event.target.checked);
  };
  render() {
    const { autoFocus, field, value, errors } = this.props;
    const checked = value || false;
    const htmlID = `ks-input-${field.path}`;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
        {field.config.adminDoc && <FieldDescription>{field.config.adminDoc}</FieldDescription>}
        <FieldInput css={{ height: 35 }}>
          <CheckboxPrimitive
            autoFocus={autoFocus}
            checked={checked}
            onChange={this.onChange}
            id={htmlID}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
