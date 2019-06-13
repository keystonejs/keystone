/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import Select from '@arch-ui/select';

export default class SelectField extends Component {
  onChange = option => {
    this.props.onChange(option ? option.value : null);
  };
  render() {
    const { autoFocus, field, value: serverValue, renderContext, errors } = this.props;
    const value = field.options.find(i => i.value === serverValue);
    const htmlID = `ks-input-${field.path}`;
    const canRead = errors.every(
      error => !(error instanceof Error && error.name === 'AccessDeniedError')
    );
    const error = errors.find(
      error => error instanceof Error && error.name === 'AccessDeniedError'
    );

    const selectProps =
      renderContext === 'dialog'
        ? {
            menuPortalTarget: document.body,
            menuShouldBlockScroll: true,
          }
        : null;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
        <FieldInput>
          <div css={{ flex: 1 }}>
            <Select
              autoFocus={autoFocus}
              value={canRead ? value : undefined}
              placeholder={canRead ? undefined : error.message}
              options={field.options}
              onChange={this.onChange}
              isClearable
              id={`react-select-${htmlID}`}
              inputId={htmlID}
              instanceId={htmlID}
              {...selectProps}
            />
          </div>
        </FieldInput>
      </FieldContainer>
    );
  }
}
