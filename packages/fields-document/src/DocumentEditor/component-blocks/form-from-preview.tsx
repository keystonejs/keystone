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
  ComponentPropField,
  ConditionalField,
  FormField,
  ObjectField,
  PreviewProps,
  RelationshipData,
  RelationshipField,
} from './api';
import { assertNever } from './utils';

const fieldRenderers: {
  [Key in ComponentPropField['kind']]: (props: {
    props: PreviewProps<Extract<ComponentPropField, { kind: Key }>> & {
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
            return <SortableItemInForm key={val.id} {...val} />;
          })}
        </SortableList>
        <Button
          autoFocus={props.autoFocus}
          onClick={() => {
            props.onInsert();
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
        <FieldLabel>{props.field.label}</FieldLabel>
        <RelationshipSelect
          autoFocus={props.autoFocus}
          controlShouldRenderValue
          isDisabled={false}
          list={keystone.adminMeta.lists[props.field.listKey]}
          extraSelection={props.field.selection || ''}
          portalMenu
          state={
            props.field.many
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
      <props.field.Input
        autoFocus={!!props.autoFocus}
        value={props.value}
        onChange={props.onChange}
        forceValidation={!!props.forceValidation}
      />
    );
  },
  object: function ObjectField({ props }) {
    const firstFocusable = props.autoFocus ? findFocusableObjectFieldKey(props.field) : undefined;
    return (
      <Stack gap="xlarge">
        {Object.entries(props.fields).map(
          ([key, propVal]) =>
            isNonChildFieldPreviewProps(propVal) && (
              <FormValueContentFromPreview
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
    const discriminant = props.field.discriminant as FormField<string | boolean, unknown>;
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
          <FormValueContentFromPreview {...props.value} />
        )}
      </Stack>
    );
  },
};

export type NonChildFieldComponentPropField =
  | FormField<any, any>
  | ObjectField
  | ConditionalField<FormField<string | boolean, any>, { [key: string]: ComponentPropField }>
  | RelationshipField<boolean>
  | ArrayField<ComponentPropField>;

function isNonChildFieldPreviewProps(
  props: PreviewProps<ComponentPropField>
): props is PreviewProps<NonChildFieldComponentPropField> {
  const kind: ComponentPropField['kind'] = (props as any)?.field?.kind;
  if (!kind) {
    return false;
  }
  return true;
}

export const FormValueContentFromPreview = memo(function FormValueContentFromPreview(
  props: PreviewProps<NonChildFieldComponentPropField> & {
    autoFocus?: boolean;
    forceValidation?: boolean;
  }
) {
  if (props.field.preview) {
    return <props.field.preview {...(props as any)} />;
  }

  const Comp = fieldRenderers[props.field.kind];
  return <Comp props={props as any} />;
});

const SortableItemInForm = memo(function SortableItemInForm(
  props: PreviewProps<ArrayField<ComponentPropField>>['elements'][number]
) {
  return (
    <SortableItem id={props.id}>
      <Stack across align="center" gap="small" css={{ justifyContent: 'center' }}>
        <DragHandle />
      </Stack>
      {isNonChildFieldPreviewProps(props.element) && (
        <FormValueContentFromPreview {...props.element} />
      )}
    </SortableItem>
  );
});

function findFocusableObjectFieldKey(prop: ObjectField): string | undefined {
  for (const [key, innerProp] of Object.entries(prop.value)) {
    const childFocusable = canFieldBeFocused(innerProp);
    if (childFocusable) {
      return key;
    }
  }
  return undefined;
}

export function canFieldBeFocused(prop: ComponentPropField): boolean {
  if (
    prop.kind === 'array' ||
    prop.kind === 'conditional' ||
    prop.kind === 'form' ||
    prop.kind === 'relationship'
  ) {
    return true;
  }
  if (prop.kind === 'child') {
    return false;
  }
  if (prop.kind === 'object') {
    for (const innerProp of Object.values(prop.value)) {
      if (canFieldBeFocused(innerProp)) {
        return true;
      }
    }
    return false;
  }
  assertNever(prop);
}
