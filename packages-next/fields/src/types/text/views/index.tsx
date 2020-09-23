/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextInput, TextArea } from '@keystone-ui/fields';

import {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-spike/types';
import { Link } from '@keystone-spike/admin-ui/router';
import { Fragment } from 'react';

export const Field = ({ field, value, onChange }: FieldProps<typeof controller>) => (
  <FieldContainer>
    <FieldLabel>{field.label}</FieldLabel>
    {field.isMultiline ? (
      <TextArea
        onChange={event => {
          onChange(event.target.value);
        }}
        value={value}
      />
    ) : (
      <TextInput
        onChange={event => {
          onChange(event.target.value);
        }}
        value={value}
      />
    )}
  </FieldContainer>
);

export const Cell: CellComponent = ({ item, path, linkTo }) => {
  let value = item[path] + '';
  return linkTo ? <Link {...linkTo}>{value}</Link> : <Fragment>{value}</Fragment>;
};
Cell.supportsLinkTo = true;

type Config = FieldControllerConfig<{ isMultiline: boolean }>;

export const controller = (
  config: Config
): FieldController<string, string> & { isMultiline: boolean } => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: '',
    isMultiline: config.fieldMeta.isMultiline,
    deserialize: data => {
      const value = data[config.path];
      return typeof value === 'string' ? value : '';
    },
    serialize: value => ({ [config.path]: value }),
    filter: {
      graphql: ({ type, value }) => {
        const key = type === 'is_i' ? `${config.path}_i` : `${config.path}_${type}`;
        return { [key]: value };
      },
      format: ({ label, value }) => {
        return `${label}: "${value}"`;
      },
      types: {
        contains_i: {
          label: 'Contains',
          initialValue: '',
        },
        not_contains_i: {
          label: 'Does not contain',
          initialValue: '',
        },
        is_i: {
          label: 'Is exactly',
          initialValue: '',
        },
        not_i: {
          label: 'Is not exactly',
          initialValue: '',
        },
        starts_with_i: {
          label: 'Starts with',
          initialValue: '',
        },
        not_starts_with_i: {
          label: 'Does not start with',
          initialValue: '',
        },
        ends_with_i: {
          label: 'Ends with',
          initialValue: '',
        },
        not_ends_with_i: {
          label: 'Does not end with',
          initialValue: '',
        },
      },
    },
  };
};
