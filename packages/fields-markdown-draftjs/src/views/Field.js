/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component } from 'react';

import { FieldContainer, FieldLabel } from '@arch-ui/fields';

import Editor from './Editor';

export default class MarkdownField extends Component {
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

    if (!canRead) return null;

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
          {field.label}
        </FieldLabel>
        <div css={{ display: 'flex', flex: 1 }}>
          <Editor value={value} onChange={this.onChange} id={htmlID} autoFocus={autoFocus} />
        </div>
      </FieldContainer>
    );
  }
}
