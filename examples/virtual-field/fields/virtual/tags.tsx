/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldProps } from '@keystone-6/core/types';
import { FieldContainer, FieldDescription, FieldLabel, Select } from '@keystone-ui/fields';
import { controller } from '@keystone-6/core/fields/types/virtual/views';
import useFieldForeignListKey from '../useFieldForeignListKey';
import { useState, type KeyboardEventHandler } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo';

const SEARCH_TAGS = gql`
  query Tags {
    tags {
      id
      title
    }
  }
`;

const labelName = "title"

export const Field = (props: FieldProps<typeof controller>) => {
  // Get metadata properties using a custom hook
  const metaProps = useFieldForeignListKey(props.field.listKey, props.field.path);

  // Initialize state with the provided value, defaulting to an empty array
  const value = typeof props.value === 'object' ? props.value : [];
  const [items, setItems] = useState<{ id?: string, [labelName]: string }[]>(value);

  /* Queries */
  const [inputValue, setInputValue] = useState<string>("");
  const { data, loading, error } = useQuery<{ tags: any[] }>(SEARCH_TAGS, {
    variables: { where: { title: { startsWith: inputValue } } },
    skip: !inputValue,  // Only run the query after the input has a value
  });

  /* Handlers */
  // Adds items only if they do not already share a label
  const addItem = (item: any) => {
    if (items.filter((v) => v[labelName] === item.label).length === 0) {
      onChange([...items, { [labelName]: item.label, id: item.value || undefined }])
    }
  }

  const removeItem = (item: any) => {
    onChange(items.filter((v) => v[labelName] !== item[labelName]))
  }

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
    onChange(reorderedItems)
  };

  // Allows for entering a lable that does NOT already exist, after hitting the "enter" key
  const onEnter: KeyboardEventHandler<HTMLInputElement> = (event) => {
    console.log(event)
    if (event.key === "Enter"
      && inputValue
      && !items.find((v) => v[labelName] === inputValue)) {
      console.log(inputValue)
      addItem({ label: inputValue })
    }
  }

  // Handles both the item state and the onChange
  const onChange = (orderedItems: any) => {
    setItems(orderedItems)
    props.onChange?.(orderedItems)
  }

  return (
    <FieldContainer>
      <FieldLabel>{props.field.label}</FieldLabel>
      <FieldDescription id={`${props.field.path}-description`}>
        {props.field.description}
      </FieldDescription>

      <Select
        options={
          !data ?
            [] :
            data.tags
              .map((v) => ({ value: v.id, label: v[labelName] }))
        }
        value={null}
        onChange={addItem}
        onKeyDown={onEnter}
        onInputChange={(v) => setInputValue(v)}
        css={{ marginBottom: "12px" }}
        isLoading={loading}
      />

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
                <Draggable key={item[labelName]} draggableId={item[labelName]} index={index}>
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
                        {item[labelName]}
                      </div>
                      <button onClick={() => removeItem(item)}>
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
    </FieldContainer>
  );
};
