/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldProps } from '@keystone-6/core/types';
import { FieldContainer, FieldDescription, FieldLabel } from '@keystone-ui/fields';
import { controller } from '@keystone-6/core/fields/types/virtual/views';
import useFieldForeignListKey from '../useFieldForeignListKey';
import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo';

const SEARCH_TAGS = gql`
  query Tags($where: TagWhereInput!) {
    tags(where: $where) {
      id
      title
    }
  }
`;

export const Field = (props: FieldProps<typeof controller>) => {
  // Get metadata properties using a custom hook
  const metaProps = useFieldForeignListKey(props.field.listKey, props.field.path);

  // Effect hook to handle the foreign list key if available
  useEffect(() => {
    if (metaProps.foreignListKey) {
      console.log(metaProps.foreignListKey); // Log foreign list key for debugging purposes
    }
  }, [metaProps]);

  // Initialize state with the provided value, defaulting to an empty array
  const value = typeof props.value === 'object' ? props.value : [];
  const [items, setItems] = useState<any[]>(value);

  // Reorder function to rearrange items in the list
  const reorder = (list: any[], startIndex: number, endIndex: number): any[] => {
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
    const reorderedItems = reorder(items, source.index, destination.index);
    // Update state with reordered items and trigger the change handler
    setItems(reorderedItems);
    props.onChange?.(reorderedItems);
  };
  
  const [inputValue, setInputValue] = useState('');
  const { data, loading, error } = useQuery<{ tags: any[] }>(SEARCH_TAGS, {
    variables: { where: { title: { startsWith: inputValue } } },
    skip: !inputValue,  // Only run the query after the input has a value
  });

  // Render the field with drag-and-drop support
  return (
    <FieldContainer>
      <FieldLabel>{props.field.label}</FieldLabel>
      <FieldDescription id={`${props.field.path}-description`}>
        {props.field.description}
      </FieldDescription>
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type to search tags..."
        />
        {loading && <div>Loading...</div>}
        {error && <div>Error loading tags!</div>}
        {data && (
          <ul>
            {data.tags.map(tag => (
              <li key={tag.id}>{tag.title}</li>
            ))}
          </ul>
        )}
      </div>
      {/* Set up the drag-and-drop context */}
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
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
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
                        ...provided.draggableProps.style,
                      }}
                    >
                      {/* Display the item's title */}
                      {item.title}
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
    </FieldContainer>
  );
};
