/** @jsxRuntime classic */
/** @jsx jsx */
import "./orderable.css";
import { jsx } from '@keystone-ui/core';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { Item, OrderableItem } from '..';
import { Trash2Icon } from "../../../../../design-system/packages/icons/src";

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
            className="container"
          >
            {/* Iterate through items to render each as draggable */}
            {props.items.map((item, index) => (
              <Draggable key={item.key} draggableId={item.key} index={index}>
                {(provided) => (
                  <Orderable
                    provided={provided}
                    item={item}
                    onClick={() => props.onChange(
                      props.items.filter((v: any) => v.key !== item.key)
                    )}
                  />
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

function Orderable(props: any) {
  const { provided, item, onClick } = props

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className="orderable"
      style={{ ...provided.draggableProps.style }}
    >
      {/* Drag handle */}
      <div className="icon clickable centered grab" {...provided.dragHandleProps}>
        {svg_handle}
      </div>
      {/* Display the item's title */}
      <div className="text clickable">
        {item.label}
      </div>
      {/* Delete button */}
      <button onClick={onClick} className="icon clickable centered trash">
        <Trash2Icon size="small" />
      </button>
    </div>
  )
}

const svg_handle = (
  <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4h3v3H6V4Zm5 0h3v3h-3V4ZM9 9H6v3h3V9Zm2 0h3v3h-3V9Zm-2 5H6v3h3v-3Zm2 0h3v3h-3v-3Z" fill="currentColor"></path>
  </svg>
)
