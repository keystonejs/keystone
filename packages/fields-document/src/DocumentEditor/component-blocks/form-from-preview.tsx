/** @jsxRuntime classic */
/** @jsx jsx */
import { useKeystone } from '@keystone-6/core/admin-ui/context';
import { RelationshipSelect } from '@keystone-6/core/fields/types/relationship/views/RelationshipSelect';
import { Button } from '@keystone-ui/button';
import { jsx, Stack } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { memo, useMemo } from 'react';
import { ReactElement } from 'react';
import { DragHandle, SortableItem, SortableList } from '../primitives/sortable';
import {
  ArrayField,
  ComponentSchema,
  ConditionalField,
  FormField,
  ObjectField,
  PreviewProps,
  RelationshipData,
  RelationshipField,
} from './api';
import { assertNever } from './utils';

const fieldRenderers: {
  [Key in ComponentSchema['kind']]: (props: {
    props: PreviewProps<Extract<ComponentSchema, { kind: Key }>> & {
      autoFocus?: boolean;
      forceValidation?: boolean;
    };
  }) => ReactElement | null;
} = {
  array({ props }) {
    return (
      <Stack gap="medium">
        <SortableList {...props}>
          {props.elements.map(val => {
            return <SortableItemInForm elementKey={val.key} {...val} />;
          })}
        </SortableList>
        <Button
          autoFocus={props.autoFocus}
          onClick={() => {
            props.onChange([...props.elements.map(x => ({ key: x.key })), { key: undefined }]);
          }}
        >
          Add
        </Button>
      </Stack>
    );
  },
  relationship: function RelationshipField({ props }) {
    const keystone = useKeystone();
    return (
      <FieldContainer>
        <FieldLabel>{props.schema.label}</FieldLabel>
        <RelationshipSelect
          autoFocus={props.autoFocus}
          controlShouldRenderValue
          isDisabled={false}
          list={keystone.adminMeta.lists[props.schema.listKey]}
          extraSelection={props.schema.selection || ''}
          portalMenu
          state={
            props.schema.many
              ? {
                  kind: 'many',
                  value: (props.value as RelationshipData[]).map(x => ({
                    id: x.id,
                    label: x.label || x.id,
                    data: x.data,
                  })),
                  onChange: props.onChange,
                }
              : {
                  kind: 'one',
                  value: props.value
                    ? {
                        ...(props.value as RelationshipData),
                        label:
                          (props.value as RelationshipData).label ||
                          (props.value as RelationshipData).id,
                      }
                    : null,
                  onChange: props.onChange,
                }
          }
        />
      </FieldContainer>
    );
  },
  child: () => null,
  form: function FormField({ props }) {
    return (
      <props.schema.Input
        autoFocus={!!props.autoFocus}
        value={props.value}
        onChange={props.onChange}
        forceValidation={!!props.forceValidation}
      />
    );
  },
  object: function ObjectField({ props }) {
    const firstFocusable = props.autoFocus ? findFocusableObjectFieldKey(props.schema) : undefined;
    return (
      <Stack gap="xlarge">
        {Object.entries(props.fields).map(
          ([key, propVal]) =>
            isNonChildFieldPreviewProps(propVal) && (
              <FormValueContentFromPreviewProps
                autoFocus={key === firstFocusable}
                key={key}
                {...propVal}
              />
            )
        )}
      </Stack>
    );
  },
  conditional: function ConditionalField({ props }) {
    const discriminant = props.schema.discriminant as FormField<string | boolean, unknown>;
    return (
      <Stack gap="xlarge">
        {useMemo(
          () => (
            <discriminant.Input
              autoFocus={!!props.autoFocus}
              value={props.discriminant}
              onChange={props.onChange}
              forceValidation={false}
            />
          ),
          [props.autoFocus, discriminant, props.discriminant, props.onChange]
        )}
        {isNonChildFieldPreviewProps(props.value) && (
          <FormValueContentFromPreviewProps {...props.value} />
        )}
      </Stack>
    );
  },
};

export type NonChildFieldComponentSchema =
  | FormField<any, any>
  | ObjectField
  | ConditionalField<FormField<any, any>, { [key: string]: ComponentSchema }>
  | RelationshipField<boolean>
  | ArrayField<ComponentSchema>;

function isNonChildFieldPreviewProps(
  props: PreviewProps<ComponentSchema>
): props is PreviewProps<NonChildFieldComponentSchema> {
  return props.schema.kind !== 'child';
}

export const FormValueContentFromPreviewProps = memo(function FormValueContentFromPreview(
  props: PreviewProps<NonChildFieldComponentSchema> & {
    autoFocus?: boolean;
    forceValidation?: boolean;
  }
) {
  const Comp = fieldRenderers[props.schema.kind];
  return <Comp props={props as any} />;
});

const SortableItemInForm = memo(function SortableItemInForm(
  props: PreviewProps<ComponentSchema> & { elementKey: string }
) {
  return (
    <SortableItem elementKey={props.elementKey}>
      <Stack across align="center" gap="small" css={{ justifyContent: 'center' }}>
        <DragHandle />
      </Stack>
      {isNonChildFieldPreviewProps(props) && <FormValueContentFromPreviewProps {...props} />}
    </SortableItem>
  );
});

function findFocusableObjectFieldKey(schema: ObjectField): string | undefined {
  for (const [key, innerProp] of Object.entries(schema.fields)) {
    const childFocusable = canFieldBeFocused(innerProp);
    if (childFocusable) {
      return key;
    }
  }
  return undefined;
}

export function canFieldBeFocused(schema: ComponentSchema): boolean {
  if (
    schema.kind === 'array' ||
    schema.kind === 'conditional' ||
    schema.kind === 'form' ||
    schema.kind === 'relationship'
  ) {
    return true;
  }
  if (schema.kind === 'child') {
    return false;
  }
  if (schema.kind === 'object') {
    for (const innerProp of Object.values(schema.fields)) {
      if (canFieldBeFocused(innerProp)) {
        return true;
      }
    }
    return false;
  }
  assertNever(schema);
}
