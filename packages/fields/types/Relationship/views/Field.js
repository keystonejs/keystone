/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { ShieldIcon } from '@arch-ui/icons';
import { colors } from '@arch-ui/theme';

import RelationshipSelect from './RelationshipSelect';

export default class RelationshipField extends Component {
  onChange = option => {
    const { field, onChange } = this.props;
    const { many } = field.config;
    if (many) {
      onChange(option.map(i => i.value));
    } else {
      onChange(option ? option.value : null);
    }
  };
  render() {
    const { autoFocus, field, value, renderContext, error } = this.props;
    const { many } = field.config;
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
          <RelationshipSelect
            autoFocus={autoFocus}
            isMulti={many}
            field={field}
            value={value}
            error={error}
            renderContext={renderContext}
            htmlID={htmlID}
            onChange={this.onChange}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
