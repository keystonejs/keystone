/* @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import { FieldContainer, Checkbox } from '@keystone-ui/fields';
import {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-spike/types';
import { Fragment } from 'react';

export const Field = ({ field, value, onChange }: FieldProps<typeof controller>) => {
  const { fields, typography } = useTheme();
  return (
    <FieldContainer>
      <Checkbox
        disabled={onChange === undefined}
        onChange={event => {
          onChange?.(event.target.checked);
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

type CheckboxController = FieldController<boolean, boolean>;

export const controller = (config: FieldControllerConfig): CheckboxController => {
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
    filter: {
      Filter() {
        return null;
      },
      graphql({ type, value }) {
        const key = type === 'is' ? `${config.path}` : `${config.path}_${type}`;
        return { [key]: value };
      },
      format({ label }) {
        return label;
      },
      types: {
        is: {
          label: 'is',
          initialValue: true,
        },
        not: {
          label: 'is not',
          initialValue: true,
        },
      },
    },
  };
};
