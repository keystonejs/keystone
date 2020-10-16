/* @jsx jsx */
import { jsx } from '@keystone-ui/core';
import { CellLink, CellContainer } from '@keystone-spike/admin-ui/components';
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';

import {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-spike/types';

// TODO: Bring across the datetime/datetimeUtc interfaces, date picker, etc.

export const Field = ({ field, value, onChange }: FieldProps<typeof controller>) => (
  <FieldContainer>
    <FieldLabel>{field.label}</FieldLabel>
    <TextInput
      readOnly={onChange === undefined}
      onChange={event => {
        onChange?.(event.target.value);
      }}
      value={value}
    />
  </FieldContainer>
);

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  let value = item[field.path];
  return linkTo ? <CellLink {...linkTo}>{value}</CellLink> : <CellContainer>{value}</CellContainer>;
};
Cell.supportsLinkTo = true;

export const controller = (config: FieldControllerConfig): FieldController<string, string> => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: '',
    deserialize: data => data[config.path],
    serialize: value => ({ [config.path]: value }),
  };
};
