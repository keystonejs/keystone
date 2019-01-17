/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { ShieldIcon } from '@voussoir/icons';
import { colors } from '@arch-ui/theme';

import RelationshipSelect from './RelationshipSelect';

export default class RelationshipField extends Component {
  onChange = option => {
    const { field, onChange } = this.props;
    const { many } = field.config;
    if (many) {
      onChange(field, option.map(i => i.value));
    } else {
      onChange(field, option ? option.value : null);
    }
  };
  render() {
    const { autoFocus, field, item, itemErrors, renderContext } = this.props;
    const { many } = field.config;
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
          <RelationshipSelect
            autoFocus={autoFocus}
            isMulti={many}
            field={field}
            item={item}
            itemErrors={itemErrors}
            renderContext={renderContext}
            htmlID={htmlID}
            onChange={this.onChange}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
