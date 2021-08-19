/* @jsx jsx */

import { FieldProps } from '@keystone-next/keystone/types';
import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextArea, TextInput } from '@keystone-ui/fields';
import { controller } from '@keystone-next/keystone/fields/types/text/views';

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => (
  <FieldContainer>
    <FieldLabel>{field.label} with custom view</FieldLabel>
    {onChange ? (
      field.displayMode === 'textarea' ? (
        <TextArea
          autoFocus={autoFocus}
          onChange={event => onChange(event.target.value)}
          value={value}
        />
      ) : (
        <TextInput
          autoFocus={autoFocus}
          onChange={event => onChange(event.target.value)}
          value={value}
        />
      )
    ) : (
      value
    )}
  </FieldContainer>
);
