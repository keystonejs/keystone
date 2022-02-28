/** @jsxRuntime classic */
/** @jsx jsx */

import {
  fields,
  ArrayField,
  ConditionalField,
  ObjectField,
} from '@keystone-6/fields-document/component-blocks';
import {
  SortableList,
  SortableItem,
  DragHandle,
} from '@keystone-6/fields-document/src/DocumentEditor/primitives/sortable';
import { Button } from '@keystone-ui/button';
import { jsx } from '@keystone-ui/core';
import { Select } from '@keystone-ui/fields';

const label = fields.text({ label: 'Label' });

const leaf = fields.object({
  url: fields.url({ label: 'URL' }),
  label,
});

const discriminant = fields.select({
  label: 'Type',
  options: [
    { label: 'Group', value: 'group' },
    { label: 'Leaf', value: 'leaf' },
  ] as const,
  defaultValue: 'leaf',
});

type Prop = ArrayField<
  ConditionalField<
    typeof discriminant,
    { leaf: typeof leaf; group: ObjectField<{ label: typeof label; children: Prop }> }
  >
>;

export const prop: Prop = fields.array(
  fields.conditional(discriminant, {
    leaf,
    group: fields.object({
      label,
      get children() {
        return prop;
      },
    }),
  }),
  {
    preview(props) {
      console.log(props);
      return (
        <div>
          <SortableList elements={props.elements.map((_, i) => i.toString())} move={props.move}>
            {props.elements.map((x, i) => {
              return <DraggableElement key={i} {...x} />;
            })}
          </SortableList>
          <AddButton options={props.field.element.discriminant.options} insert={props.insert} />
        </div>
      );
    },
  }
);

function AddButton<Value extends string>(props: {
  options: readonly { label: string; value: Value }[];
  insert: (initialValue: Value extends any ? { discriminant: Value } : never) => void;
}) {
  // props;
  return (
    <Select
      placeholder="Add"
      options={props.options}
      onChange={val => {
        if (val) {
          props.insert({ discriminant: val.value });
        }
      }}
      value={null}
    />
  );
}

// function UIForField() {}

function DraggableElement(props) {
  // const [isEditing, setIsEditing] = useState(false);
  return (
    <SortableItem id={props.id}>
      <DragHandle />
      {/* <Button
        onClick={() => {
          setIsEditing(true);
        }}
      >
        Edit
      </Button> */}
      blah
      {/* {isEditing ? <UIForField {...props} /> : <div>{props.value.label.value}</div>} */}
    </SortableItem>
  );
}
