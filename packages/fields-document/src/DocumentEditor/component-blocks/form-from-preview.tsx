/** @jsxRuntime classic */
/** @jsx jsx */
import { useKeystone } from '@keystone-6/core/admin-ui/context';
import { RelationshipSelect } from '@keystone-6/core/fields/types/relationship/views/RelationshipSelect';
import { Button } from '@keystone-ui/button';
import { jsx, Stack } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { memo, useMemo } from 'react';
import { ReactElement } from 'react';
import { DragHandle, OrderableItem, OrderableList } from '../primitives/orderable';
import {
  ArrayField,
  ComponentSchema,
  ConditionalField,
  FormField,
  GenericPreviewProps,
  ObjectField,
  RelationshipData,
  RelationshipField,
} from './api';
import { assertNever } from './utils';

const fieldRenderers: {
  [Key in ComponentSchema['kind']]: (props:
    GenericPreviewProps<Extract<ComponentSchema, { kind: Key }>, unknown> & {
      autoFocus?: boolean;
      forceValidation?: boolean;
    }
  ) => ReactElement | null;
} = {
  array (props) {
    return (
      <Stack gap="medium">
        <OrderableList {...props}>
          {props.elements.map(val => {
            return <OrderableItemInForm elementKey={val.key} {...val} />;
          })}
        </OrderableList>
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
  relationship ({ schema, autoFocus, onChange, value }) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const keystone = useKeystone();
    return (
      <FieldContainer>
        <FieldLabel>{schema.label}</FieldLabel>
        <RelationshipSelect
          autoFocus={autoFocus}
          controlShouldRenderValue
          isDisabled={false}
          list={keystone.adminMeta.lists[schema.listKey]}
          extraSelection={schema.selection || ''}
          portalMenu
          state={
            schema.many
              ? {
                  kind: 'many',
                  value: (value as RelationshipData[]).map(x => ({
                    id: x.id,
                    label: x.label || x.id,
                    data: x.data,
                  })),
                  onChange: onChange,
                }
              : {
                  kind: 'one',
                  value: value
                    ? {
                        ...(value as RelationshipData),
                        label:
                          (value as RelationshipData).label ||
                          (value as RelationshipData).id,
                      }
                    : null,
                  onChange: onChange,
                }
          }
        />
      </FieldContainer>
    );
  },
  child: () => null,
  form ({ schema, autoFocus, forceValidation, onChange, value }) {
    return (
      <schema.Input
        autoFocus={!!autoFocus}
        value={value}
        onChange={onChange}
        forceValidation={!!forceValidation}
      />
    );
  },
  object ({ schema, autoFocus, fields }) {
    const firstFocusable = autoFocus ? findFocusableObjectFieldKey(schema) : undefined;
    return (
      <Stack gap="xlarge">
        {Object.entries(fields).map(
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
  conditional ({ schema, autoFocus, discriminant, onChange, value }) {
    const schemaDiscriminant = schema.discriminant as FormField<string | boolean, unknown>;
    return (
      <Stack gap="xlarge">
        {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useMemo(
          () => (
            <schemaDiscriminant.Input
              autoFocus={!!autoFocus}
              value={discriminant}
              onChange={onChange}
              forceValidation={false}
            />
          ),
          [autoFocus, schemaDiscriminant, discriminant, onChange]
        )}
        {isNonChildFieldPreviewProps(value) && (
          <FormValueContentFromPreviewProps {...value} />
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
  props: GenericPreviewProps<ComponentSchema, unknown>
): props is GenericPreviewProps<NonChildFieldComponentSchema, unknown> {
  return props.schema.kind !== 'child';
}

export const FormValueContentFromPreviewProps = memo(function FormValueContentFromPreview(
  props: GenericPreviewProps<NonChildFieldComponentSchema, unknown> & {
    autoFocus?: boolean;
    forceValidation?: boolean;
  }
) {
  const Comp = fieldRenderers[props.schema.kind];
  return <Comp {...props as any} />;
});

const OrderableItemInForm = memo(function OrderableItemInForm(
  props: GenericPreviewProps<ComponentSchema, unknown> & { elementKey: string }
) {
  return (
    <OrderableItem elementKey={props.elementKey}>
      <Stack across align="center" gap="small" css={{ justifyContent: 'center' }}>
        <DragHandle />
      </Stack>
      {isNonChildFieldPreviewProps(props) && <FormValueContentFromPreviewProps {...props} />}
    </OrderableItem>
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
