/* @jsx jsx */
import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';

import {
  CellComponent,
  FieldControllerConfig,
  FieldProps,
  makeController,
} from '@keystone-spike/types';
import { Link } from '@keystone-spike/admin-ui/router';
import { Fragment } from 'react';

// TODO: Bring across the datetime/datetimeUtc interfaces, date picker, etc.

export const Field = ({ field, value, onChange }: FieldProps<typeof controller>) => (
  <FieldContainer>
    <FieldLabel>{field.label}</FieldLabel>
    <TextInput
      onChange={event => {
        onChange(event.target.value);
      }}
      value={value}
    />
  </FieldContainer>
);

export const Cell: CellComponent = ({ item, path, linkTo }) => {
  let value = item[path];
  return linkTo ? <Link {...linkTo}>{value}</Link> : <Fragment>{value}</Fragment>;
};
Cell.supportsLinkTo = true;

type Config = FieldControllerConfig<{}>;

export const controller = makeController((config: Config) => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: '',
    deserialize: data => data[config.path],
    serialize: value => ({ [config.path]: value }),
  };
});
