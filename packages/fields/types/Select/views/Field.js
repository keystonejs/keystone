/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import Select from '@arch-ui/select';
import { ShieldIcon } from '@arch-ui/icons';
import { colors } from '@arch-ui/theme';

export default class SelectField extends Component {
  onChange = option => {
    const { field, onChange } = this.props;
    onChange(field, option ? option.value : null);
  };
  render() {
    const { autoFocus, field, value: serverValue, renderContext, itemErrors } = this.props;
    const value = field.options.find(i => i.value === serverValue);
    const htmlID = `ks-input-${field.path}`;
    const canRead = !(
      itemErrors[field.path] instanceof Error && itemErrors[field.path].name === 'AccessDeniedError'
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
        <FieldLabel
          htmlFor={htmlID}
          css={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {field.label}{' '}
          {!canRead ? (
            <ShieldIcon
              title={itemErrors[field.path].message}
              css={{ color: colors.N20, marginRight: '1em' }}
            />
          ) : null}
        </FieldLabel>
        <FieldInput>
          <Select
            autoFocus={autoFocus}
            value={canRead ? value : undefined}
            placeholder={canRead ? undefined : itemErrors[field.path].message}
            options={field.options}
            onChange={this.onChange}
            id={`react-select-${htmlID}`}
            inputId={htmlID}
            instanceId={htmlID}
            {...selectProps}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
