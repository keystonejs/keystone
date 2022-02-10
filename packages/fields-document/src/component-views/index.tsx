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
  prop: ComponentPropField;
} => {
  if (!config.customViews.prop) {
    throw new Error(
      `No prop in custom view. Did you forgot to set \`views\` to a file that exports a \`prop\` on ${config.listKey}.${config.path}`
    );
  }
  console.log(config.customViews.prop);
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: `${config.path}`,
    prop: config.customViews.prop,
    defaultValue: getInitialPropsValue(config.customViews.prop, {}),
    deserialize: data => {
      return data[config.path];
    },
    serialize: value => ({
      [config.path]: value,
    }),
  };
};
