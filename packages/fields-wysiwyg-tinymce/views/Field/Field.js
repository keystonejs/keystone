/* eslint-disable import/no-extraneous-dependencies */
/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component } from 'react';

import { FieldContainer, FieldLabel } from '@arch-ui/fields';
import { ShieldIcon } from '@arch-ui/icons';
import { colors } from '@arch-ui/theme';

import Editor from '../Editor';

export default class WysiwygField extends Component {
  onChange = value => {
    if (typeof value === 'string' && value !== this.props.value) {
      this.props.onChange(value);
    }
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
        <div css={{ display: 'flex' }}>
          <Editor
            value={canRead ? value : undefined}
            onChange={this.onChange}
            id={htmlID}
            autoFocus={autoFocus}
          />
        </div>
      </FieldContainer>
    );
  }
}
