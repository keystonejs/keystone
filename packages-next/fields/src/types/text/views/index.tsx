/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextInput, TextArea } from '@keystone-ui/fields';

import {
  CellProps,
  FieldControllerConfig,
  FieldProps,
  makeController,
} from '@keystone-spike/types';

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

export const Cell = ({ item, path }: CellProps) => {
  return item[path] + '';
};

type Config = FieldControllerConfig<{ isMultiline: boolean }>;

export const controller = makeController((config: Config) => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: '',
    isMultiline: config.fieldMeta.isMultiline,
    deserialize: data => data[config.path] || '',
    serialize: value => ({ [config.path]: value }),
  };
});
