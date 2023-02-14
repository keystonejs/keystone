/** @jsxRuntime classic */
/** @jsx jsx */

import { FieldProps } from '@keystone-6/core/types';
import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextArea, TextInput } from '@keystone-ui/fields';
import { controller } from '@keystone-6/core/fields/types/text/views';

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => (
  <FieldContainer>
    <FieldLabel>{field.label} with custom view</FieldLabel>
    {onChange ? (
      field.displayMode === 'textarea' ? (
        <TextArea
          autoFocus={autoFocus}
          onChange={event => {
            onChange({ ...value, inner: { kind: 'value', value: event.target.value } });
          }}
          value={value.inner.kind === 'null' ? '' : value.inner.value}
        />
      ) : (
        <TextInput
          autoFocus={autoFocus}
          onChange={event => {
            onChange({ ...value, inner: { kind: 'value', value: event.target.value } });
          }}
          value={value.inner.kind === 'null' ? '' : value.inner.value}
        />
      )
    ) : value.inner.kind === 'null' ? null : (
      value.inner.value
    )}
  </FieldContainer>
);
