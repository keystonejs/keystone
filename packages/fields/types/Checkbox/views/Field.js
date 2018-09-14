import React, { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@voussoir/ui/src/primitives/fields';

// TODO: use pretty checkboxes - these only work in a CheckGroup situation.
// import { Checkbox } from '@voussoir/ui/src/primitives/forms';

export default class TextField extends Component {
  onChange = event => {
    const { field, onChange } = this.props;
    onChange(field, event.target.checked);
  };
  render() {
    const { autoFocus, field, item } = this.props;
    const checked = item[field.path] || false;
    const htmlID = `ks-input-${field.path}`;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID}>{field.label}</FieldLabel>
        <FieldInput>
          <input
            autoFocus={autoFocus}
            type="checkbox"
            checked={checked}
            onChange={this.onChange}
            id={htmlID}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
