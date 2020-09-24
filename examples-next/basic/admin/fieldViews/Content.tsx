/* @jsx jsx */

import { jsx } from '@emotion/core';
import { useTheme } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';

type FieldProps = {
  field: any;
};

export const Field = ({ field }: FieldProps) => {
  const { fields } = useTheme();
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <textarea
        css={{
          backgroundColor: fields.inputBackground,
          borderWidth: 1,
          borderRadius: fields.inputBorderRadius,
          ':hover': {
            borderColor: fields.inputBorderColor,
          },
        }}
      />
    </FieldContainer>
  );
};
