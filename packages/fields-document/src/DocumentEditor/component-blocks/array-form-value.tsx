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
import { useState } from 'react';
import { useDocumentFieldRelationships } from '../relationship';
import { getInitialPropsValue } from './initial-values';
import { ArrayField, ComponentPropField } from './api';
import { FormValueContent } from './form';

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
}: {
  path: (string | number)[];
  prop: ArrayField<ComponentPropField>;
  value: any[];
  onChange(value: any[]): void;
  stringifiedPropPathToAutoFocus: string;
  forceValidation: boolean;
}) {
  const relationships = useDocumentFieldRelationships();
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  // this key stuff will sort of produce a less ideal experience if the value array
  // is modified outside of this component, mainly if adding items in the middle or re-ordering
  const [keys, setKeys] = useState(() => value.map(() => (keyCount++).toString()));

  const diff = value.length - keys.length;

  if (diff > 0) {
    setKeys(keys.concat(Array.from({ length: diff }).map(() => (keyCount++).toString())));
    return null;
  } else if (diff < 0) {
    setKeys(value.slice(0, keys.length - 1));
    return null;
  }

  console.log(keys);

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
          onChange(arrayMove(value, activeIndex, overIndex));
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
            listStyle: 'none',
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
                path={path.concat(i)}
                prop={prop.element}
                value={val}
                onChange={val => {
                  const newValue = [...value];
                  newValue[i] = val;
                  onChange(newValue);
                }}
                onRemove={() => {
                  const newKeys = [...keys];
                  newKeys.splice(i, 1);
                  setKeys(newKeys);
                  const newValue = [...value];
                  newValue.splice(i, 1);
                  onChange(newValue);
                }}
              />
            );
          })}
          <Button
            onClick={() => {
              onChange([...value, getInitialPropsValue(prop.element, relationships)]);
            }}
          >
            Add
          </Button>
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({
  id,
  onRemove,
  ...props
}: {
  id: string;
  path: (string | number)[];
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
      css={{ transform: `translateX(var(--translate-x, 0)) translateY(var(--translate-y, 0))` }}
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
}
