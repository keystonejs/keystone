/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldProps } from '@keystone-6/core/types';
import { FieldContainer, FieldDescription, FieldLabel } from '@keystone-ui/fields';
import { controller } from '@keystone-6/core/fields/types/virtual/views';
import { AutocompleteSelect, OrderableList, type Item } from '../../src/primatives'
import useFieldForeignListKey from '../useFieldForeignListKey';

export const Field = (props: FieldProps<typeof controller>) => {
  // Get metadata properties using a custom hook
  const metaProps = useFieldForeignListKey(props.field.listKey, props.field.path);

  // Initialize state with the provided value, defaulting to an empty array
  const value = typeof props.value === 'object' ? props.value : [];

  return (
    <FieldContainer>
      <FieldLabel>{props.field.label}</FieldLabel>
      <FieldDescription id={`${props.field.path}-description`}>
        {props.field.description}
      </FieldDescription>

      {(props.onChange && metaProps.foreignListKey && metaProps.foreignLabelPath) ? (
        <ComponentWrapper
          foreignListKey={metaProps.foreignListKey}
          foreignLabelPath={metaProps.foreignLabelPath}
          onChange={props.onChange}
          value={value}
        />
      ) : null}
    </FieldContainer>
  );
};

function ComponentWrapper(props: {
  foreignListKey: string;
  foreignLabelPath: string;
  value: any[];
  onChange: (values: any) => void;
}) {
  // Formatting the value to be typeof Item[]
  const value: Item[] = props.value.map((v) => ({ label: v[props.foreignLabelPath], value: v.id }))

  /* Handlers */
  // Adds items only if they do not already share a label
  const addItem = (item: Item) => {
    if (value.filter((v) => v.label === item.label).length === 0) {
      onChange([...value, item])
    }
  }
  // Handles both the item state and the onChange
  const onChange = (items: Item[]) => {
    props.onChange(items.map(i => ({ [props.foreignLabelPath]: i.label, id: i.value })))
  }

  return (
    <div>
      <AutocompleteSelect
        listKey={props.foreignListKey}
        fieldPath={props.foreignLabelPath}
        onChange={addItem}
        ignoreValues={value.map((v) => v.label)}
      />
      <OrderableList
        items={value.map(i => ({ ...i, key: i.label }))}
        onChange={onChange}
      />
    </div>
  )
}