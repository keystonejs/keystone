/* @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';

import { FieldController, FieldControllerConfig, FieldProps } from '@keystone-spike/types';

export const Field = ({ field }: FieldProps<typeof controller>) => {
  const { radii, palette } = useTheme();
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <code
        css={{
          borderWidth: 1,
          borderRadius: radii.small,
          padding: 8,
          fontSize: '0.9rem',
          cursor: 'default',
          color: palette.neutral500,
          backgroundColor: palette.neutral100,
        }}
      >
        {'{ relationship }'}
      </code>
    </FieldContainer>
  );
};

export const Cell = () => {
  return null;
};

type RelationshipController = FieldController<void>;

export const controller = (config: FieldControllerConfig): RelationshipController => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: '',
    defaultValue: undefined,
    deserialize: () => {},
    serialize: () => ({}),
  };
};
