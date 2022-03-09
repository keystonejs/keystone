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
              onChange?.({
                kind: valueRef.current.kind,
                value: transformProps(field.prop, valueRef.current.value, (prop, value, path) => {
                  if (prop.kind === 'array' && areArraysEqual(path, pathToInsertIn)) {
                    const newVal = [...(value as any[]), getInitialPropsValue(prop)];
                    setElementIdsForArrayValue(newVal, [
                      ...getElementIdsForArrayValue(value as unknown[]),
                      getNewArrayElementId(),
                    ]);
                    return newVal;
                  }
                  return value;
                }),
              });
            },
          }),
          [autoFocus, forceValidation, onChange, field.prop]
        )}
        onChange={useCallback(
          getNewVal => {
            onChange?.({ kind: valueRef.current.kind, value: getNewVal(valueRef.current.value) });
          },
          [onChange]
        )}
        path={basePath}
        prop={field.prop}
        value={value.value}
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
): FieldController<{ kind: 'create' | 'update'; value: unknown }> & {
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
    graphqlSelection: `${config.path}Raw(hydrateRelationships: true)`,
    prop: config.customViews.prop,
    defaultValue: { kind: 'create', value: getInitialPropsValue(config.customViews.prop) },
    deserialize: data => {
      return {
        kind: 'update',
        value: data[`${config.path}Raw`],
      };
    },
    serialize: value => {
      return {
        [config.path]: serializeValue(config.customViews.prop, value.value, value.kind),
      };
    },
  };
};

function serializeValue(
  prop: ComponentPropFieldForGraphQL,
  value: any,
  kind: 'update' | 'create'
): any {
  if (prop.kind === 'conditional') {
    return {
      [value.discriminant]: serializeValue(prop.values[value.discriminant], value.value, kind),
    };
  }
  if (prop.kind === 'array') {
    return (value as any[]).map(a => serializeValue(prop.element, a, kind));
  }
  if (prop.kind === 'form') {
    return value;
  }
  if (prop.kind === 'object') {
    return Object.fromEntries(
      Object.entries(prop.value).map(([key, val]) => {
        return [key, serializeValue(val, value[key], kind)];
      })
    );
  }
  if (prop.kind === 'relationship') {
    if (Array.isArray(value)) {
      return {
        [kind === 'create' ? 'connect' : 'set']: value.map(x => ({ id: x.id })),
      };
    }
    if (value === null) {
      if (kind === 'create') {
        return undefined;
      }
      return { disconnect: true };
    }
    return {
      connect: { id: value.id },
    };
  }
  assertNever(prop);
}
