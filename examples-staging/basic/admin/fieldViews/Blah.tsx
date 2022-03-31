/** @jsxRuntime classic */
/** @jsx jsx */

import {
  fields,
  ArrayField,
  ConditionalField,
  ComponentPropField,
  FormField,
} from '@keystone-6/fields-document/component-blocks';
import { PreviewProps } from '@keystone-6/fields-document/src/DocumentEditor/component-blocks/api';
import { FormValueContentFromPreview } from '@keystone-6/fields-document/src/DocumentEditor/component-blocks/form-from-preview';
import { jsx, Stack } from '@keystone-ui/core';
import { AlertDialog } from '@keystone-ui/modals';
import { ButtonHTMLAttributes, useCallback, useEffect, useState, useRef } from 'react';
import {
  AddButton,
  SortableList,
  SortableItem,
  DragHandle,
} from '@keystone-6/fields-document/primitives';

type ComponentsFields<Components extends Record<string, ComponentPropField>> = ArrayField<
  ConditionalField<
    FormField<keyof Components & string, readonly { value: keyof Components; label: string }[]>,
    Components
  >
>;

const returnUndefined = () => undefined;

function components<
  Components extends {
    [Key in keyof Components]: {
      label: string;
      field: ComponentPropField;
      subtitle?: (props: PreviewProps<Components[Key]['field']>) => string | undefined;
      children?: (
        props: PreviewProps<Components[Key]['field']>
      ) => PreviewProps<ComponentPropField> | undefined;
    };
  }
>(
  components: Components
): ComponentsFields<{
  [Key in keyof Components]: Components[Key]['field'];
}> {
  const comps = components as unknown as Record<
    string,
    {
      label: string;
      field: ComponentPropField;
      subtitle?: (props: PreviewProps<ComponentPropField>) => string | undefined;
      children?: (
        props: PreviewProps<ComponentPropField>
      ) => PreviewProps<ComponentPropField> | undefined;
    }
  >;
  const labels = new Map(Object.entries(comps).map(([key, { label }]) => [key, label]));
  const field = fields.array(
    fields.conditional(
      fields.select({
        label: 'Type',
        options: Object.entries(comps).map(([value, { label }]) => ({
          value: value,
          label,
        })),
        defaultValue: Object.keys(comps)[0],
      }),
      Object.fromEntries(Object.entries(comps).map(([value, { field }]) => [value, field]))
    ),
    {
      preview: function Preview(props) {
        const elementsRef = useRef(props.elements);
        useEffect(() => {
          elementsRef.current = props.elements;
        });
        const propsOnRemove = props.onRemove;
        const onRemove = useCallback(
          (id: string) => {
            const idx = elementsRef.current.findIndex(e => e.id === id);
            propsOnRemove(idx);
          },
          [propsOnRemove]
        );
        return (
          <Stack gap="medium">
            {!!props.elements.length && (
              <SortableList {...props}>
                {props.elements.map(x => {
                  return (
                    <DraggableElement
                      key={x.id}
                      id={x.id}
                      props={x.element.value}
                      label={labels.get(x.element.discriminant)!}
                      children={comps[x.element.discriminant].children ?? returnUndefined}
                      subtitle={comps[x.element.discriminant].subtitle ?? returnUndefined}
                      onRemove={onRemove}
                    />
                  );
                })}
              </SortableList>
            )}
            <AddButton
              options={props.field.element.discriminant.options}
              onInsert={props.onInsert}
            />
          </Stack>
        );
      },
    }
  );
  return field as any;
}

function componentThing<Field extends ComponentPropField>(component: {
  label: string;
  field: Field;
  subtitle?: (props: PreviewProps<Field>) => string | undefined;
  children?: (props: PreviewProps<Field>) => PreviewProps<ComponentPropField> | undefined;
}) {
  return component;
}

export const prop: ArrayField<ComponentPropField> = components({
  leaf: componentThing({
    label: 'Leaf',
    field: fields.object({
      label: fields.text({ label: 'Label' }),
      url: fields.url({ label: 'URL' }),
    }),
    subtitle: props => props.fields.label.value,
  }),
  group: componentThing({
    label: 'Group',
    field: fields.object({
      label: fields.text({ label: 'Label' }),
      get children() {
        return prop;
      },
    }),
    subtitle: props =>
      `${props.fields.label.value ? props.fields.label.value + ' — ' : ''}${
        props.fields.children.elements.length
      } Items`,
    children: props => props.fields.children,
  }),
});

const DraggableElement = function DraggableElement<Field extends ComponentPropField>(props: {
  props: PreviewProps<Field>;
  id: string;
  label: string;
  subtitle: (props: PreviewProps<Field>) => string | undefined;
  children: (props: PreviewProps<Field>) => PreviewProps<ComponentPropField> | undefined;
  onRemove: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChildrenOpen, setIsChildrenOpen] = useState(true);
  const childrenProps = props.children(props.props);
  return (
    <SortableItem id={props.id}>
      <Stack gap="medium">
        <div css={{ display: 'flex', gap: 4 }}>
          <Stack across gap="xsmall" align="center" css={{ cursor: 'pointer' }}>
            <DragHandle />
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
              {props.label.slice(0, 2)}
            </div>
          </Stack>
          <button
            css={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              cursor: 'pointer',
              backgroundColor: 'transparent',
              ':hover': {
                backgroundColor: '#F6F8FC',
              },
              borderRadius: 8,
            }}
            onClick={() => {
              setIsEditing(true);
            }}
          >
            <span css={{ fontSize: 16, fontWeight: 'bold' }}>{props.label}</span>
            <span css={{ fontSize: 12 }}>{props.subtitle(props.props)}</span>
          </button>
          <Stack across gap="xsmall" align="center">
            {/* <IconButton
              onClick={() => {
                setIsEditing(true);
              }}
            >
              {editIcon}
            </IconButton> */}
            <IconButton
              onClick={() => {
                props.onRemove(props.id);
              }}
            >
              {removeIcon}
            </IconButton>
            {childrenProps && (
              <Stack across gap="xsmall" align="center">
                <div css={{ width: 1, height: 28, backgroundColor: '#E9EBF3' }} />
                <IconButton
                  aria-label={`${isChildrenOpen ? 'Close' : 'Open'} ${props.label} children`}
                  onClick={() => {
                    setIsChildrenOpen(!isChildrenOpen);
                  }}
                  style={isChildrenOpen ? {} : { transform: 'rotate(180deg)' }}
                >
                  {downChevron}
                </IconButton>
              </Stack>
            )}
          </Stack>
        </div>
        {isChildrenOpen && childrenProps !== undefined && (
          <FormValueContentFromPreview {...childrenProps} />
        )}
        <AlertDialog
          title={`Edit ${props.label}`}
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
          <FormValueContentFromPreview {...props.props} />
        </AlertDialog>
      </Stack>
    </SortableItem>
  );
};

function IconButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      css={{
        border: '0',
        background: 'transparent',
        cursor: 'pointer',
        ':hover,:focus': {
          background: '#F6F8FC',
        },
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 28,
        width: 28,
      }}
      {...props}
    />
  );
}

const removeIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.75 1.125H11.25V2.25H6.75V1.125ZM2.25 3.375V4.5H3.375V15.75C3.375 16.0484 3.49353 16.3345 3.7045 16.5455C3.91548 16.7565 4.20163 16.875 4.5 16.875H13.5C13.7984 16.875 14.0845 16.7565 14.2955 16.5455C14.5065 16.3345 14.625 16.0484 14.625 15.75V4.5H15.75V3.375H2.25ZM4.5 15.75V4.5H13.5V15.75H4.5ZM6.75 6.75H7.875V13.5H6.75V6.75ZM10.125 6.75H11.25V13.5H10.125V6.75Z"
      fill="#596794"
    />
  </svg>
);

const downChevron = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 13.75L3.75 7.5L4.625 6.625L10 12L15.375 6.625L16.25 7.5L10 13.75Z"
      fill="#596794"
    />
  </svg>
);
