/* @jsx jsx */

import { FieldProps } from '@keystone-next/types';
import { jsx, useTheme } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';

export const Field = ({
  field,
  value,
  onChange,
}: FieldProps<typeof import('@keystone-next/fields/types/text/views').controller>) => {
  const { fields } = useTheme();
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <textarea
        value={value}
        readOnly={onChange === undefined}
        onChange={event => {
          onChange?.(event.target.value);
        }}
        css={{
          backgroundColor: fields.inputBackground,
          borderWidth: 1,
          borderRadius: fields.inputBorderRadius,
          ':hover': {
            borderColor: fields.inputBorderColor,
          },
        }}
      />
      custom
    </FieldContainer>
  );
};
