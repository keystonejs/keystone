/* @jsx jsx */

import { CellContainer, CellLink } from '@keystone-next/keystone/admin-ui/components';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-next/types';
import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextArea } from '@keystone-ui/fields';

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => (
  <FieldContainer>
    <FieldLabel>{field.label}</FieldLabel>
    {onChange ? (
      <TextArea
        autoFocus={autoFocus}
        onChange={event => onChange(event.target.value)}
        value={value}
      />
    ) : (
      value
    )}
  </FieldContainer>
);

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  let value = item[field.path] + '';
  return linkTo ? <CellLink {...linkTo}>{value}</CellLink> : <CellContainer>{value}</CellContainer>;
};
Cell.supportsLinkTo = true;

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path]}
    </FieldContainer>
  );
};

type Config = FieldControllerConfig<{ displayMode: 'input' | 'textarea' }>;

export const controller = (
  config: Config
): FieldController<string, string> & { displayMode: 'input' | 'textarea' } => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: '',
    displayMode: config.fieldMeta.displayMode,
    deserialize: data => {
      const value = data[config.path];
      console.log('deserialize', value, data);
      return typeof value === 'string' ? value : '';
    },
    serialize: value => {
      console.log('serialize', value);
      return { [config.path]: value };
    },
  };
};
