/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@voussoir/ui/src/primitives/fields';
import { Input } from '@voussoir/ui/src/primitives/forms';
import { ShieldIcon } from '@voussoir/icons';
import { colors } from '@voussoir/ui/src/theme';

export default class UrlField extends Component {
  onChange = event => {
    const { field, onChange } = this.props;
    onChange(field, event.target.value);
  };
  render() {
    const { autoFocus, field, item, itemErrors } = this.props;
    const value = item[field.path] || '';
    const htmlID = `ks-input-${field.path}`;
    const canRead = !(
      itemErrors[field.path] instanceof Error && itemErrors[field.path].name === 'AccessDeniedError'
    );

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
          <Input
            autoComplete="off"
            autoFocus={autoFocus}
            type="url"
            value={canRead ? value : undefined}
            placeholder={canRead ? undefined : itemErrors[field.path].message}
            onChange={this.onChange}
            id={htmlID}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
