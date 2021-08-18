/* @jsx jsx */

import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-next/types';
import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';

import { PrettyData } from './PrettyData';

export const Field = ({ field, value }: FieldProps<typeof controller>) =>
  value === createViewValue ? null : (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <PrettyData data={value} />
    </FieldContainer>
  );

export const Cell: CellComponent = ({ item, field }) => {
  return <PrettyData data={item[field.path]} />;
};

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <PrettyData data={item[field.path]} />
    </FieldContainer>
  );
};

const createViewValue = Symbol('create view virtual field value');

export const controller = (
  config: FieldControllerConfig<{ graphQLReturnFragment: string }>
): FieldController<any> => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: `${config.path}${config.fieldMeta.graphQLReturnFragment}`,
    defaultValue: createViewValue,
    deserialize: data => {
      return data[config.path];
    },
    serialize: () => ({}),
  };
};
