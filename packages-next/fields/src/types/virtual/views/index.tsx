/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';

import {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-spike/types';
import { PrettyData } from './PrettyData';

export const Field = ({ field, value }: FieldProps<typeof controller>) => (
  <FieldContainer>
    <FieldLabel>{field.label}</FieldLabel>
    <PrettyData data={value} />
  </FieldContainer>
);

export const Cell: CellComponent = ({ item, field }) => {
  return <PrettyData data={item[field.path]} />;
};

export const controller = (config: FieldControllerConfig): FieldController<any> => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: '',
    deserialize: data => {
      return data[config.path];
    },
    serialize: () => ({}),
  };
};
