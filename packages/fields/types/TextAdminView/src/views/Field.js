/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { Input } from '@arch-ui/input';
import { ShieldIcon } from '@arch-ui/icons';
import { colors } from '@arch-ui/theme';

export class TextField extends Component {
  onChange = event => {
    this.props.onChange(event.target.value);
  };
  render() {
    const { autoFocus, field, error, value: serverValue } = this.props;
    const value = serverValue || '';
    const htmlID = `ks-input-${field.path}`;
    const canRead = !(error instanceof Error && error.name === 'AccessDeniedError');

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
            <ShieldIcon title={error.message} css={{ color: colors.N20, marginRight: '1em' }} />
          ) : null}
        </FieldLabel>
        <FieldInput>
          <Input
            autoComplete="off"
            autoFocus={autoFocus}
            type="text"
            value={canRead ? value : undefined}
            placeholder={canRead ? undefined : error.message}
            onChange={this.onChange}
            id={htmlID}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
