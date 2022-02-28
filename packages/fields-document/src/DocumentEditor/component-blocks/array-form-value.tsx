/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, Stack } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import { arrayMove } from '@dnd-kit/sortable';
import { memo, useMemo, useState } from 'react';
import { useDocumentFieldRelationships } from '../relationship';
import { DragHandle, SortableItem, SortableList } from '../primitives/sortable';
import { getInitialPropsValue } from './initial-values';
import { ArrayField, ComponentPropField } from './api';
import { ComponentFieldProps, FormValueContent } from './form';
import { PropPath, ReadonlyPropPath } from './utils';

let keyCount = 0;

export function ArrayFormValueContent({
  prop,
  path,
  value,
  onChange,
  stringifiedPropPathToAutoFocus,
  forceValidation,
  onAddArrayItem,
}: ComponentFieldProps<ArrayField<ComponentPropField>>) {
  const relationships = useDocumentFieldRelationships();

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
            return newValue;
          });
        },
        onRemove: () => {
          setKeys(keys => {
            const newKeys = [...keys];
            newKeys.splice(i, 1);
            return newKeys;
          });
          onChange(value => {
            const newValue = [...value];
            newValue.splice(i, 1);
            return newValue;
          });
        },
        path: path.concat(i),
      };
    });
  }, [length, onChange, path]);

  // this key stuff will sort of produce a less ideal experience if the value array
  // is modified outside of this component, mainly if adding items in the middle or re-ordering
  const [keys, setKeys] = useState(() => value.map(() => (keyCount++).toString()));

  const diff = value.length - keys.length;

  if (diff > 0) {
    setKeys(keys.concat(Array.from({ length: diff }).map(() => (keyCount++).toString())));
    return null;
  } else if (diff < 0) {
    setKeys(keys.slice(0, keys.length - 1));
    return null;
  }

  return (
    <Stack gap="medium">
      <SortableList
        elements={keys}
        move={(from, to) => {
          setKeys(arrayMove(keys, from, to));
          onChange(value => arrayMove(value as any[], from, to));
        }}
      >
        {value.map((val, i) => {
          return (
            <SortableItemInForm
              key={keys[i]}
              id={keys[i]}
              forceValidation={forceValidation}
              stringifiedPropPathToAutoFocus={stringifiedPropPathToAutoFocus}
              onAddArrayItem={onAddArrayItem}
              prop={prop.element}
              value={val}
              {...memoizedPropsForItems[i]}
            />
          );
        })}
      </SortableList>
      <Button
        onClick={() => {
          onChange(value => [...value, getInitialPropsValue(prop.element)]);
        }}
      >
        Add
      </Button>
    </Stack>
  );
}

const SortableItemInForm = memo(function SortableItemInForm({
  id,
  onRemove,
  ...props
}: {
  id: string;
  path: PropPath;
  prop: ComponentPropField;
  value: any;
  onChange(value: any): void;
  stringifiedPropPathToAutoFocus: string;
  forceValidation: boolean;
  onRemove: () => void;
  onAddArrayItem: (path: ReadonlyPropPath) => void;
}) {
  return (
    <SortableItem id={id}>
      <Stack across align="center" gap="small" css={{ justifyContent: 'center' }}>
        <DragHandle />
        <Button tone="negative" onClick={onRemove}>
          Remove
        </Button>
      </Stack>
      <FormValueContent {...props} />s
    </SortableItem>
  );
});
