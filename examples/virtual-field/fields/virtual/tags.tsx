/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core'
import { FieldProps } from '@keystone-6/core/types'
import { FieldContainer, FieldDescription, FieldLabel } from '@keystone-ui/fields'
import { controller } from '@keystone-6/core/fields/types/virtual/views'
// import useFieldProps from '../useFieldProps'
import { useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';

interface Item {
  id: string;
  title: string;
}

export const Field = (props: FieldProps<typeof controller>) => {
  // const metaProps = useFieldProps(props.field.listKey, props.field.path)
  const value = typeof props.value === "object" ? props.value : []
  const [items, setItems] = useState<Item[]>(value);

  const reorder = (list: Item[], startIndex: number, endIndex: number): Item[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    const reorderedItems = reorder(items, source.index, destination.index);
    setItems(reorderedItems);
    props.onChange?.(reorderedItems);
  };
  return (
    <FieldContainer>
      <FieldLabel>{props.field.label}</FieldLabel>
      <FieldDescription id={`${props.field.path}-description`}>{props.field.description}</FieldDescription>
      <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable-list">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              background: 'lightgray',
              padding: '10px',
              borderRadius: '5px',
            }}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      userSelect: 'none',
                      padding: '8px',
                      margin: '0 0 8px 0',
                      background: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '3px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      ...provided.draggableProps.style,
                    }}
                  >
                    {item.title}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
    </FieldContainer>
  )
}