/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldProps } from '@keystone-6/core/types';
import { FieldContainer, FieldDescription, FieldLabel } from '@keystone-ui/fields';
import { controller } from '@keystone-6/core/fields/types/virtual/views';
import { useState } from 'react';
import { gql } from '@keystone-6/core/admin-ui/apollo';
import { AutocompleteSelect, OrderableList, type Item } from '../../src/primatives'
import useFieldForeignListKey from '../useFieldForeignListKey';

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

  /* Handlers */
  // Adds items only if they do not already share a label
  const addItem = (item: Item) => {
    if (items.filter((v) => v[labelName] === item.label).length === 0) {
      onChange([...items.map(i => ({ label: i[labelName], value: i.id })), item])
    }
  }
  // Handles both the item state and the onChange
  const onChange = (items: Item[]) => {
    const reorderedItems = items.map(i => ({ [labelName]: i.label, id: i.value }))
    setItems(reorderedItems)
    props.onChange?.(reorderedItems)
  }

  return (
    <FieldContainer>
      <FieldLabel>{props.field.label}</FieldLabel>
      <FieldDescription id={`${props.field.path}-description`}>
        {props.field.description}
      </FieldDescription>

      <AutocompleteSelect
        gql={SEARCH_TAGS}
        onChange={addItem}
      />
      <OrderableList
        items={items.map(i => ({ key: i[labelName], label: i[labelName], value: i.id }))}
        onChange={onChange}
      />
    </FieldContainer>
  );
};
