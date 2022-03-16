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
import { Button } from '@keystone-ui/button';
import { jsx, Stack } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { AlertDialog } from '@keystone-ui/modals';
import { useState } from 'react';
import { EditIcon } from '@keystone-ui/icons/icons/EditIcon';
import {
  AddButton,
  SortableList,
  SortableItem,
  DragHandle,
} from '@keystone-6/fields-document/primitives';

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

      <AddButton options={props.field.element.discriminant.options} onInsert={props.onInsert} />
    </Stack>
  );
}
export const prop: Prop = fields.array(conditional, {
  preview: Preview,
});

function DraggableElement(props: PreviewProps<Prop>['elements'][number]) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChildrenOpen, setIsChildrenOpen] = useState(true);
  const label = props.element.options.find(x => x.value === props.element.discriminant)!.label;
  return (
    <SortableItem id={props.id}>
      <Stack gap="medium">
        <div css={{ display: 'flex', justifyContent: 'space-between' }}>
          <Stack across gap="xsmall" align="center">
            <DragHandle />
            <button
              onClick={() => {
                setIsEditing(true);
              }}
              css={{
                border: '0',
                background: 'transparent',
                cursor: 'pointer',
                ':hover,:focus': {
                  background: '#f0f0f0',
                },

                borderRadius: 8,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 24,
                width: 28,
              }}
            >
              <EditIcon size="small" color="#596794" />
            </button>
            <div
              css={{
                background: '#F6F8FC',
                border: '1px solid #E9EBF3',
                height: 32,
                width: 32,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 4,
              }}
            >
              {label.slice(0, 2)}
            </div>

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
              <FormValueContentFromPreview {...props.element.value} />
            </AlertDialog>
            <div>{props.element.value.fields.label.value}</div>
          </Stack>
          {props.element.discriminant === 'group' && (
            <Button
              onClick={() => {
                setIsChildrenOpen(!isChildrenOpen);
              }}
            >
              {isChildrenOpen ? 'Close' : 'Open'}
            </Button>
          )}
        </div>
        {isChildrenOpen && props.element.discriminant === 'group' && (
          <Preview {...props.element.value.fields.children} />
        )}
      </Stack>
    </SortableItem>
  );
}
