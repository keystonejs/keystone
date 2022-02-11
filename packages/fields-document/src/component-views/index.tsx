/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';

import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-6/core/types';
import { FormValueContent } from '../DocumentEditor/component-blocks/form';
import { ComponentPropField } from '../component-blocks';
import { getInitialPropsValue } from '../DocumentEditor/component-blocks/initial-values';
import { ComponentPropFieldForGraphQL } from '../DocumentEditor/component-blocks/api';
import { assertNever } from '../DocumentEditor/component-blocks/utils';

export const Field = ({
  field,
  value,
  onChange,
  autoFocus,
  forceValidation,
}: FieldProps<typeof controller>) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <FormValueContent
        forceValidation={!!forceValidation}
        onChange={value => {
          onChange?.(value);
        }}
        path={[]}
        prop={field.prop}
        value={value}
        stringifiedPropPathToAutoFocus={autoFocus ? '' : ''}
      />
    </FieldContainer>
  );
};

export const Cell: CellComponent = ({}) => {
  return null;
};

export const CardValue: CardValueComponent = ({}) => {
  return null as any;
};

export const allowedExportsOnCustomViews = ['prop'];

export const controller = (
  config: FieldControllerConfig
): FieldController<unknown> & {
  prop: ComponentPropFieldForGraphQL;
} => {
  if (!config.customViews.prop) {
    throw new Error(
      `No prop in custom view. Did you forgot to set \`views\` to a file that exports a \`prop\` on ${config.listKey}.${config.path}`
    );
  }
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: `${config.path}Raw`,
    prop: config.customViews.prop,
    defaultValue: getInitialPropsValue(config.customViews.prop, {}),
    deserialize: data => {
      return data[config.path + 'Raw'];
    },
    serialize: value => ({
      [config.path]: serializeThing(config.customViews.prop, value),
    }),
  };
};

const serializeThing = (prop: ComponentPropFieldForGraphQL, value: any): any => {
  if (prop.kind === 'conditional') {
    return {
      [value.discriminant]: serializeThing((prop.values as any)[value.discriminant], value.value),
    };
  }
  if (prop.kind === 'array') {
    return (value as any[]).map(a => serializeThing(prop.element, a));
  }
  if (prop.kind === 'form') {
    return value;
  }
  if (prop.kind === 'object') {
    return Object.fromEntries(
      Object.entries(prop.value).map(([key, val]) => {
        return [key, serializeThing(val, value[key])];
      })
    );
  }
  if (prop.kind === 'relationship') {
    // TODO
  }
  assertNever(prop);
};
