/** @jsxRuntime classic */
/** @jsx jsx */

import {
  fields,
  ArrayField,
  ConditionalField,
  ObjectField,
} from '@keystone-6/fields-document/component-blocks';
import { PreviewProps } from '@keystone-6/fields-document/src/DocumentEditor/component-blocks/api';
import { FormValueContentFromPreview } from '@keystone-6/fields-document/src/DocumentEditor/component-blocks/form-from-preview';
import {
  SortableList,
  SortableItem,
  DragHandle,
} from '@keystone-6/fields-document/src/DocumentEditor/primitives/sortable';
import { Button } from '@keystone-ui/button';
import { jsx, Stack } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, Select } from '@keystone-ui/fields';
import { AlertDialog } from '@keystone-ui/modals';
import { useState } from 'react';

const label = fields.text({ label: 'Label' });

const leaf = fields.object({
  url: fields.url({ label: 'URL' }),
  label,
  author: fields.relationship({
    label: 'Author',
    listKey: 'User',
  }),
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

const conditional = fields.conditional(discriminant, {
  leaf,
  group: fields.object({
    label,
    get children() {
      return innerChildren;
    },
  }),
});

const innerChildren: Prop = fields.array(conditional, {
  preview(props) {
    return (
      <FieldContainer>
        <FieldLabel>Children</FieldLabel>
        <Preview {...props} />
      </FieldContainer>
    );
  },
});

function Preview(props: PreviewProps<Prop>) {
  return (
    <Stack gap="medium">
      {!!props.elements.length && (
        <SortableList {...props}>
          {props.elements.map(x => {
            return <DraggableElement key={x.id} {...x} />;
          })}
        </SortableList>
      )}
      <AddButton options={props.field.element.discriminant.options} insert={props.onInsert} />
    </Stack>
  );
}
export const prop: Prop = fields.array(conditional, {
  preview: Preview,
});

function AddButton<Value extends string>(props: {
  options: readonly { label: string; value: Value }[];
  insert: (initialValue: Value extends any ? { discriminant: Value } : never) => void;
}) {
  return (
    <Select
      placeholder="Add"
      options={props.options}
      onChange={val => {
        if (val) {
          props.insert({ discriminant: val.value } as any);
        }
      }}
      value={null}
    />
  );
}

function DraggableElement(props: PreviewProps<Prop>['elements'][number]) {
  const [isEditing, setIsEditing] = useState(false);
  const label = props.element.options.find(x => x.value === props.element.discriminant)!.label;
  return (
    <SortableItem id={props.id}>
      <Stack gap="medium">
        <Stack across align="center">
          <DragHandle />
          <Button
            onClick={() => {
              setIsEditing(true);
            }}
          >
            Edit {label}
          </Button>
          <AlertDialog
            title={`Edit ${label}`}
            actions={{
              confirm: {
                action: () => {
                  setIsEditing(false);
                },
                label: 'Done',
              },
            }}
            isOpen={isEditing}
          >
            <FormValueContentFromPreview props={props.element.value} />
          </AlertDialog>
          <div>{props.element.value.fields.label.value}</div>
        </Stack>
        {props.element.discriminant === 'group' && (
          <Preview {...props.element.value.fields.children} />
        )}
      </Stack>
    </SortableItem>
  );
}
