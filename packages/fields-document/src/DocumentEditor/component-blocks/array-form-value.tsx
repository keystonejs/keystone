/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, Stack } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import { arrayMove } from '@dnd-kit/sortable';
import { memo, useMemo } from 'react';
import { DragHandle, SortableItem, SortableList } from '../primitives/sortable';
import { getInitialPropsValue } from './initial-values';
import { ArrayField, ComponentPropField } from './api';
import { CommonComponentFieldProps, ComponentFieldProps, FormValueContent } from './form';
import { ReadonlyPropPath } from './utils';
import {
  getElementIdsForArrayValue,
  getNewArrayElementId,
  setElementIdsForArrayValue,
} from './preview-props';

export function ArrayFormValueContent({
  prop,
  path,
  value,
  onChange,
  common,
}: ComponentFieldProps<ArrayField<ComponentPropField>>) {
  const { length } = value;
  // this is not ideal since every item will re-render after adding a new item
  // and many will re-render after a re-order
  // but it does mean not every item will be re-rendered for changes within an item
  // which is the most performance-sensitive case since it'll be for an input or etc.
  const memoizedPropsForItems = useMemo(() => {
    return Array.from({ length }).map((_, i) => {
      return {
        onChange: (cb: (val: any) => any) => {
          onChange(value => {
            const newValue = [...value];
            newValue[i] = cb(newValue[i]);
            setElementIdsForArrayValue(newValue, getElementIdsForArrayValue(value));
            return newValue;
          });
        },
        path: path.concat(i),
      };
    });
  }, [length, onChange, path]);
  const elementIds = getElementIdsForArrayValue(value);
  return (
    <Stack gap="medium">
      <SortableList
        elements={elementIds}
        onMove={(from, to) => {
          onChange(value => {
            const newValue = arrayMove(value as any[], from, to);
            setElementIdsForArrayValue(newValue, arrayMove(elementIds, from, to));
            return newValue;
          });
        }}
        onRemove={index => {
          onChange(value => {
            const newValue = [...value];
            newValue.splice(index, 1);
            const newKeys = [...getElementIdsForArrayValue(value)];
            newKeys.splice(index, 1);
            setElementIdsForArrayValue(newValue, newKeys);
            return newValue;
          });
        }}
      >
        {value.map((val, i) => {
          return (
            <SortableItemInForm
              key={elementIds[i]}
              id={elementIds[i]}
              common={common}
              prop={prop.element}
              value={val}
              {...memoizedPropsForItems[i]}
            />
          );
        })}
      </SortableList>
      <Button
        onClick={() => {
          onChange(value => {
            const newValue = [...value, getInitialPropsValue(prop.element)];
            setElementIdsForArrayValue(newValue, [...newValue, getNewArrayElementId()]);
            return newValue;
          });
        }}
      >
        Add
      </Button>
    </Stack>
  );
}

const SortableItemInForm = memo(function SortableItemInForm({
  id,
  ...props
}: {
  id: string;
  path: ReadonlyPropPath;
  prop: ComponentPropField;
  value: any;
  onChange(value: any): void;
  common: CommonComponentFieldProps;
}) {
  return (
    <SortableItem id={id}>
      <Stack across align="center" gap="small" css={{ justifyContent: 'center' }}>
        <DragHandle />
      </Stack>
      <FormValueContent {...props} />s
    </SortableItem>
  );
});
