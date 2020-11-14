/* @jsx jsx */

import { CellContainer } from '@keystone-next/admin-ui/components';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-next/types';
import { jsx, useTheme } from '@keystone-ui/core';
import { Checkbox, FieldContainer, FieldLabel } from '@keystone-ui/fields';

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => {
  const { fields, typography } = useTheme();
  return (
    <FieldContainer>
      <Checkbox
        autoFocus={autoFocus}
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

export const Cell: CellComponent = ({ item, field }) => {
  const value = !!item[field.path];
  return (
    <CellContainer>
      <Checkbox disabled checked={value} size="small">
        <span css={{}}>{value ? 'True' : 'False'}</span>
      </Checkbox>
    </CellContainer>
  );
};

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path] + ''}
    </FieldContainer>
  );
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
    filter: {
      Filter() {
        return null;
      },
      graphql({ type, value }) {
        const key = type === 'is' ? `${config.path}` : `${config.path}_${type}`;
        return { [key]: value };
      },
      Label({ label }) {
        return label.toLowerCase();
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
