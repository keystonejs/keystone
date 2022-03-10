/** @jsxRuntime classic */
/** @jsx jsx */
import { Box, jsx } from '@keystone-ui/core';
import { useMemo } from 'react';
import {
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  DndContext,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { createContext, ReactNode, useContext } from 'react';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Popover } from '@keystone-ui/popover';
import { ToolbarButton } from '.';

const RemoveContext = createContext<null | ((index: number) => void)>(null);

export function SortableList(props: {
  onMove: (index: number, newIndex: number) => void;
  onRemove: (index: number) => void;
  elements: readonly ({ id: string } | string)[];
  children: ReactNode;
}) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  return (
    <RemoveContext.Provider value={props.onRemove}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={({ over, active }) => {
          if (over && over.id !== active.id) {
            const activeIndex = props.elements.findIndex(
              x => (typeof x === 'string' ? x : x.id) === active.id
            );
            const overIndex = props.elements.findIndex(
              x => (typeof x === 'string' ? x : x.id) === over.id
            );
            props.onMove(activeIndex, overIndex);
          }
        }}
      >
        <SortableContext
          items={props.elements as (string | { id: string })[]}
          strategy={verticalListSortingStrategy}
        >
          <ul
            css={{
              isolation: 'isolate',
              display: 'flex',
              gap: 8,
              flexDirection: 'column',
              padding: 0,
              margin: 0,
            }}
          >
            {props.children}
          </ul>
        </SortableContext>
      </DndContext>
    </RemoveContext.Provider>
  );
}

const DragHandleListenersContext = createContext<Pick<
  ReturnType<typeof useSortable>,
  'listeners' | 'isDragging' | 'attributes' | 'index'
> | null>(null);

export function SortableItem(props: { id: string; children: ReactNode }) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition, index } =
    useSortable({
      id: props.id,
    });

  const style = {
    transition,
    zIndex: isDragging ? 2 : 1,
    '--translate-x': `${Math.round(transform?.x ?? 0)}px`,
    '--translate-y': `${Math.round(transform?.y ?? 0)}px`,
    cursor: isDragging ? 'grabbing' : undefined,
  };
  return (
    <DragHandleListenersContext.Provider
      value={useMemo(() => {
        return {
          attributes,
          listeners,
          isDragging,
          index,
        };
      }, [attributes, listeners, isDragging, index])}
    >
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
          {props.children}
        </div>
      </li>
    </DragHandleListenersContext.Provider>
  );
}

export function DragHandle() {
  const sortable = useContext(DragHandleListenersContext);
  if (sortable === null) {
    throw new Error('Must use SortableItem above DragHandle');
  }

  const onRemove = useContext(RemoveContext);
  if (onRemove === null) {
    throw new Error('Must use SortableList above DragHandle');
  }

  return (
    <span css={{ position: 'relative' }}>
      <Popover
        placement="left"
        triggerRenderer={opts => {
          console.log(sortable.listeners);
          return (
            <div>
              <button
                {...sortable.attributes}
                {...sortable.listeners}
                {...opts.triggerProps}
                css={{
                  display: 'flex',
                  justifyContent: 'center',
                  cursor: sortable.isDragging ? 'grabbing' : undefined,
                  appearance: 'none',
                  background: 'transparent',
                  borderRadius: 4,
                  padding: 0,
                  ':focus-visible': {
                    outline: ['2px solid Highlight', '2px solid -webkit-focus-ring-color'],
                  },
                }}
                aria-label="Drag handle"
              >
                {dragIcon}
              </button>
            </div>
          );
        }}
      >
        <Box margin="small">
          <ToolbarButton
            onClick={() => {
              onRemove(sortable.index);
            }}
          >
            Remove
          </ToolbarButton>
        </Box>
      </Popover>
    </span>
  );
}

export const dragIcon = (
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
