import React, { Component } from 'react';

import {
  FieldContainer,
  FieldLabel,
  FieldInput,
} from '@keystonejs/ui/src/primitives/fields';
// TODO: Upload component?
import { Input } from '@keystonejs/ui/src/primitives/forms';

export default class FileField extends Component {
  onChange = ({ target: { validity, files: [file] } }) => {
    const { field, onChange } = this.props;
    if (!validity.valid) {
      // TODO - show error state
      return;
    }
    onChange(field, file);
  };
  render() {
    const { autoFocus, field, field: { config }, item: { avatar } } = this.props;
    return (
      <FieldContainer>
        <FieldLabel>{field.label}</FieldLabel>
        <FieldInput>
          <Input
            autocomplete="off"
            autoFocus={autoFocus}
            type="file"
            onChange={this.onChange}
          />
        </FieldInput>
        {avatar ? <img src={`${config.route}/${avatar.filename}`} /> : null}
      </FieldContainer>
    );
  }
}
