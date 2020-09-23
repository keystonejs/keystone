/* @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import { FieldContainer, Checkbox } from '@keystone-ui/fields';
import { CellComponent, FieldProps, makeController } from '@keystone-spike/types';
import { Fragment } from 'react';

export const Field = ({ field, value, onChange }: FieldProps<typeof controller>) => {
  const { fields, typography } = useTheme();
  return (
    <FieldContainer>
      <Checkbox
        onChange={event => {
          onChange(event.target.checked);
        }}
        checked={value}
      >
        <span css={{ fontWeight: typography.fontWeight.semibold, color: fields.labelColor }}>
          {field.label}
        </span>
      </Checkbox>
    </FieldContainer>
  );
};

export const Cell: CellComponent = ({ item, path }) => {
  return <Fragment>{item[path] + ''}</Fragment>;
};

export const controller = makeController(config => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: false,
    deserialize(item) {
      const value = item[config.path];
      return typeof value === 'boolean' ? value : false;
    },
    serialize(value) {
      return {
        [config.path]: value,
      };
    },
    validate() {
      // Can throw a FieldError
    },
  };
});
