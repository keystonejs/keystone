/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
} from '@keystone-next/types';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';

export { Field } from './Field';

export const Cell: CellComponent = ({ item, field }) => {
  const data = item[field.path];
  if (!data) return null;
  return (data);
};

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path]}
    </FieldContainer>
  );
};

export const controller = (config: FieldControllerConfig): FieldController<string, { config: { editorConfig: any } }> => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: '',
    deserialize(item) {
      const value = item[config.path];
      if (!value) return '';
      return value;
    },
    serialize(value) {
      return {
        [config.path]: value,
      };
    },
  };
};
