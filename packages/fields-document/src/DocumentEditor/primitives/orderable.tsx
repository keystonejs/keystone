/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@keystone-ui/core'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  DndContext,
  closestCenter,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { createContext, type ReactNode, useContext } from 'react'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { Button } from '@keystone-ui/button'
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon'

const RemoveContext = createContext<null |((index: number) => void)>(null)

export function OrderableList (props: {
  onChange: (elements: readonly { key: string }[]) => void
  elements: readonly { key: string }[]
  children: ReactNode
}) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  const elementsRef = useRef(props.elements)

  useEffect(() => {
    elementsRef.current = props.elements
  })
  const { onChange } = props
  const onRemove = useCallback(
    (index: number) => {
      onChange(elementsRef.current.filter((_, i) => i !== index).map(x => ({ key: x.key })))
    },
    [onChange]
  )
  return (
    <RemoveContext.Provider value={onRemove}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={({ over, active }) => {
          if (over && over.id !== active.id) {
            const activeIndex = props.elements.findIndex(x => x.key === active.id)
            const overIndex = props.elements.findIndex(x => x.key === over.id)
            const newValue = arrayMove(
              props.elements.map(x => ({ key: x.key })),
              activeIndex,
              overIndex
            )
            props.onChange(newValue)
          }
        }}
      >
        <SortableContext
          items={useMemo(() => props.elements.map(x => x.key), [props.elements])}
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
  )
}

const DragHandleListenersContext = createContext<Pick<
  ReturnType<typeof useSortable>,
  'listeners' | 'isDragging' | 'attributes' | 'index'
> | null>(null)

export function OrderableItem (props: { elementKey: string, children: ReactNode }) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition, index } =
    useSortable({
      id: props.elementKey,
    })

  const style = {
    transition,
    zIndex: isDragging ? 2 : 1,
    '--translate-x': `${Math.round(transform?.x ?? 0)}px`,
    '--translate-y': `${Math.round(transform?.y ?? 0)}px`,
    cursor: isDragging ? 'grabbing' : undefined,
  }
  return (
    <DragHandleListenersContext.Provider
      value={useMemo(() => {
        return {
          attributes,
          listeners,
          isDragging,
          index,
        }
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
            border: '1px solid #DFDFE7',
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
  )
}

export function RemoveButton () {
  const sortable = useContext(DragHandleListenersContext)
  const onRemove = useContext(RemoveContext)
  if (sortable === null || onRemove === null) {
    throw new Error('Must use OrderableItem above RemoveButton')
  }

  return (
    <Button
      weight="none"
      css={{ padding: 7 }}
      onClick={() => onRemove(sortable.index)}
      aria-label="Remove"
    >
      <Trash2Icon size="small" />
    </Button>
  )
}

export function DragHandle () {
  const sortable = useContext(DragHandleListenersContext)
  if (sortable === null) {
    throw new Error('Must use OrderableItem above DragHandle')
  }

  return (
    <Button
      {...sortable.attributes}
      {...sortable.listeners}
      css={{ cursor: sortable.isDragging ? 'grabbing' : undefined, padding: 7 }}
      weight="none"
      size="small"
      aria-label="Drag handle"
    >
      {dragIcon}
    </Button>
  )
}

export const dragIcon = (
  <span css={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <svg width="20" height="21" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 4h3v3H6V4Zm5 0h3v3h-3V4ZM9 9H6v3h3V9Zm2 0h3v3h-3V9Zm-2 5H6v3h3v-3Zm2 0h3v3h-3v-3Z"
        fill="currentColor"
      />
    </svg>
  </span>
)
