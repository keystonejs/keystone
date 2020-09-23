/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';

import {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-spike/types';
import { Fragment } from 'react';

export const Field = ({ field, value, onChange }: FieldProps<typeof controller>) => (
  <FieldContainer>
    <FieldLabel>{field.label}</FieldLabel>
    <TextInput
      value={value}
      onChange={event => {
        onChange(event.target.value);
      }}
    />
    {/* {item[`${field.path}_is_set`] === true ? 'Is set' : 'Is not set'} */}
  </FieldContainer>
);

export const Cell: CellComponent = ({ item, path }) => {
  return <Fragment>{item[`${path}_is_set`] ? 'Is set' : 'Is not set'}</Fragment>;
};

type PasswordController = FieldController<string, boolean>;

export const controller = (config: FieldControllerConfig): PasswordController => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: `${config.path}_is_set`,
    defaultValue: '',
    deserialize: () => '',
    serialize: value => ({ [config.path]: value }),
    filter: {
      graphql: ({ type, value }) => {
        return { [`${config.path}_${type}`]: value };
      },
      format: ({ value }) => {
        return value ? 'is set' : 'is not set';
      },
      types: {
        is_set: {
          label: 'Is Set',
          initialValue: true,
        },
      },
    },
  };
};
