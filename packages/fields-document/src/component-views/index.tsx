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
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FormValueContent } from '../DocumentEditor/component-blocks/form';
import { getInitialPropsValue } from '../DocumentEditor/component-blocks/initial-values';
import { ComponentPropFieldForGraphQL } from '../DocumentEditor/component-blocks/api';
import {
  assertNever,
  ReadonlyPropPath,
  transformProps,
} from '../DocumentEditor/component-blocks/utils';
import { areArraysEqual } from '../DocumentEditor/document-features-normalization';
import {
  getElementIdsForArrayValue,
  getNewArrayElementId,
  setElementIdsForArrayValue,
} from '../DocumentEditor/component-blocks/preview-props';

const basePath: ReadonlyPropPath = [];

export const Field = ({
  field,
  value,
  onChange,
  autoFocus,
  forceValidation,
}: FieldProps<typeof controller>) => {
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  });
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <FormValueContent
        common={useMemo(
          () => ({
            stringifiedPropPathToAutoFocus: autoFocus ? '' : '',
            forceValidation: !!forceValidation,
            onAddArrayItem: pathToInsertIn => {
              onChange?.(
                transformProps(field.prop, valueRef.current, (prop, value, path) => {
                  if (prop.kind === 'array' && areArraysEqual(path, pathToInsertIn)) {
                    const newVal = [...(value as any[]), getInitialPropsValue(prop)];
                    setElementIdsForArrayValue(newVal, [
                      ...getElementIdsForArrayValue(value as unknown[]),
                      getNewArrayElementId(),
                    ]);
                    return newVal;
                  }
                  return value;
                })
              );
            },
          }),
          [autoFocus, forceValidation, onChange, field.prop]
        )}
        onChange={useCallback(
          getNewVal => {
            onChange?.(getNewVal(valueRef.current));
          },
          [onChange]
        )}
        path={basePath}
        prop={field.prop}
        value={value}
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
    defaultValue: getInitialPropsValue(config.customViews.prop),
    deserialize: data => {
      return data[config.path + 'Raw'];
    },
    serialize: value => ({
      [config.path]: serializeValue(config.customViews.prop, value),
    }),
  };
};

const serializeValue = (prop: ComponentPropFieldForGraphQL, value: any): any => {
  if (prop.kind === 'conditional') {
    return {
      [value.discriminant]: serializeValue((prop.values as any)[value.discriminant], value.value),
    };
  }
  if (prop.kind === 'array') {
    return (value as any[]).map(a => serializeValue(prop.element, a));
  }
  if (prop.kind === 'form') {
    return value;
  }
  if (prop.kind === 'object') {
    return Object.fromEntries(
      Object.entries(prop.value).map(([key, val]) => {
        return [key, serializeValue(val, value[key])];
      })
    );
  }
  if (prop.kind === 'relationship') {
    // TODO
  }
  assertNever(prop);
};
