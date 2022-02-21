/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, Stack } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { memo, useMemo, useState } from 'react';
import { useDocumentFieldRelationships } from '../relationship';
import { getInitialPropsValue } from './initial-values';
import { ArrayField, ComponentPropField } from './api';
import { ComponentFieldProps, FormValueContent } from './form';
import { PropPath } from './utils';

const dragIcon = (
  <svg width="18" height="24" viewBox="0 0 18 24" xmlns="http://www.w3.org/2000/svg">
    <g fill="#939393">
      <circle cy="6" cx="6" r="2" />
      <circle cy="6" cx="12" r="2" />
      <circle cy="12" cx="6" r="2" />
      <circle cy="12" cx="12" r="2" />
      <circle cy="18" cx="6" r="2" />
      <circle cy="18" cx="12" r="2" />
    </g>
  </svg>
);
let keyCount = 0;

export function ArrayFormValueContent({
  prop,
  path,
  value,
  onChange,
  stringifiedPropPathToAutoFocus,
  forceValidation,
}: ComponentFieldProps<ArrayField<ComponentPropField>>) {
  const relationships = useDocumentFieldRelationships();
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={({ over, active }) => {
        if (over && over.id !== active.id) {
          const overIndex = keys.indexOf(over.id);
          const activeIndex = keys.indexOf(active.id);
          setKeys(arrayMove(keys, activeIndex, overIndex));
          onChange(value => arrayMove(value as any[], activeIndex, overIndex));
        }
      }}
    >
      <SortableContext items={keys} strategy={verticalListSortingStrategy}>
        <ul
          css={{
            isolation: 'isolate',
            display: 'flex',
            gap: 8,
            flexDirection: 'column',
            padding: 0,
          }}
        >
          {value.map((val, i) => {
            return (
              <SortableItem
                key={keys[i]}
                id={keys[i]}
                forceValidation={forceValidation}
                stringifiedPropPathToAutoFocus={stringifiedPropPathToAutoFocus}
                prop={prop.element}
                value={val}
                {...memoizedPropsForItems[i]}
              />
            );
          })}
          <Button
            onClick={() => {
              onChange(value => [...value, getInitialPropsValue(prop.element, relationships)]);
            }}
          >
            Add
          </Button>
        </ul>
      </SortableContext>
    </DndContext>
  );
}

const SortableItem = memo(function SortableItem({
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
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id,
  });

  const style = {
    transition,
    zIndex: isDragging ? 2 : 1,
    '--translate-x': `${Math.round(transform?.x ?? 0)}px`,
    '--translate-y': `${Math.round(transform?.y ?? 0)}px`,
    cursor: isDragging ? 'grabbing' : undefined,
  };
  return (
    <li
      ref={setNodeRef}
      css={{
        transform: `translateX(var(--translate-x, 0)) translateY(var(--translate-y, 0))`,
        listStyle: 'none',
      }}
      style={style}
    >
      <div
        style={{
          pointerEvents: isDragging ? 'none' : undefined,
          transform: `scale(${isDragging ? '1.02' : '1'})`,
          boxShadow: isDragging
            ? 'rgb(0 0 0 / 20%) 0px 3px 1px -2px, rgb(0 0 0 / 14%) 0px 2px 2px 0px, rgb(0 0 0 / 12%) 0px 10px 5px 0px'
            : 'rgb(0 0 0 / 20%) 0px 3px 1px -2px, rgb(0 0 0 / 14%) 0px 2px 2px 0px, rgb(0 0 0 / 12%) 0px 1px 5px 0px',
        }}
        css={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: '8px',
          transition: 'transform 100ms ease, box-shadow 150ms ease',
        }}
      >
        <Stack across align="center" gap="small" css={{ justifyContent: 'center' }}>
          <button
            {...attributes}
            css={{
              display: 'flex',
              justifyContent: 'center',
              cursor: isDragging ? 'grabbing' : 'grab',
              appearance: 'none',
              background: 'transparent',
              borderRadius: 4,
              padding: 0,
              ':focus-visible': {
                outline: ['2px solid Highlight', '2px solid -webkit-focus-ring-color'],
              },
            }}
            aria-label="Drag handle"
            {...listeners}
          >
            {dragIcon}
          </button>
          <Button tone="negative" onClick={onRemove}>
            Remove
          </Button>
        </Stack>
        <FormValueContent {...props} />
      </div>
    </li>
  );
});
