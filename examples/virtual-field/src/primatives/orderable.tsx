/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { Item, OrderableItem } from '.';

type Props = {
  items: OrderableItem[];
  onChange: (items: Item[]) => void
}

export const OrderableList = (props: Props) => {
  // Reorder function to rearrange items in the list
  const reorder = (list: OrderableItem[], startIndex: number, endIndex: number): OrderableItem[] => {
    const result = Array.from(list); // Create a copy of the list
    const [removed] = result.splice(startIndex, 1); // Remove item from startIndex
    result.splice(endIndex, 0, removed); // Insert item at endIndex
    return result; // Return the reordered list
  };

  // Handler for drag-and-drop events
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result; // Get the source and destination indices
    // If dropped outside the list, exit
    if (!destination) {
      return;
    }
    // Reorder items based on the drag-and-drop operation
    const reorderedItems = reorder(props.items, source.index, destination.index);
    // Update state with reordered items and trigger the change handler
    props.onChange(reorderedItems)
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable-list">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              background: 'lightgray',
              padding: '1px 4px',
              borderRadius: '5px',
            }}
          >
            {/* Iterate through items to render each as draggable */}
            {props.items.map((item, index) => (
              <Draggable key={item.key} draggableId={item.key} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      padding: '4px',
                      margin: '4px 0',
                      background: 'white',
                      display: 'flex',
                      justifyContent: 'space-between',
                      ...provided.draggableProps.style,
                    }}
                  >
                    {/* Display the item's title */}
                    <div>
                      {item.label}
                    </div>
                    <button onClick={() => props.onChange(props.items.filter((v) => v.key !== item.key))}>
                      ❌
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {/* Placeholder to ensure accurate list height */}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}