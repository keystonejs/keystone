/** @jsxRuntime classic */
/** @jsx jsx */
import { Button } from '@keystone-ui/button';
import { jsx, Stack } from '@keystone-ui/core';
import { memo, useMemo } from 'react';
import { ReactElement } from 'react';
import { DragHandle, SortableItem, SortableList } from '../primitives/sortable';
import { ArrayField, ComponentPropField, FormField, PreviewProps } from './api';
import { RelationshipFormInput } from './form';
import { objectFieldSymbol } from './preview-props';
import { assertNever } from './utils';

const emptyPath: never[] = [];

const fieldRenderers: {
  [Key in ComponentPropField['kind']]: (props: {
    props: PreviewProps<Extract<ComponentPropField, { kind: Key }>>;
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
          onClick={() => {
            props.onInsert();
          }}
        >
          Add
        </Button>
      </Stack>
    );
  },
  relationship({ props }) {
    return (
      <RelationshipFormInput
        common={{ stringifiedPropPathToAutoFocus: '' }}
        onChange={getVal => {
          props.onChange(getVal(props.value) as any);
        }}
        path={emptyPath}
        value={props.value}
        prop={props.field}
      />
    );
  },
  child: () => null,
  form: function FormField({ props }) {
    return (
      <props.field.Input
        autoFocus={false}
        value={props.value}
        onChange={props.onChange}
        forceValidation={false}
      />
    );
  },
  object: function ObjectField({ props }) {
    return (
      <Stack gap="xlarge">
        {Object.entries(props).map(([key, propVal]) => (
          <FormValueContentFromPreview key={key} props={propVal} />
        ))}
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
              autoFocus={false}
              value={props.discriminant}
              onChange={props.onChange}
              forceValidation={false}
            />
          ),
          [discriminant, props.discriminant, props.onChange]
        )}
        <FormValueContentFromPreview props={props.value as any} />
      </Stack>
    );
  },
};

export function FormValueContentFromPreview({
  props,
}: {
  props: PreviewProps<ComponentPropField>;
}) {
  const preview = handlePreview(props);
  if (preview !== undefined) {
    return preview;
  }

  const kind: ComponentPropField['kind'] = (props as any)[objectFieldSymbol]
    ? (props as any)[objectFieldSymbol].kind
    : (props as any).field.kind;
  const Comp = fieldRenderers[kind];
  return <Comp props={props as any} />;
}

function handlePreview(props: any) {
  const prop: ComponentPropField = props[objectFieldSymbol]
    ? props[objectFieldSymbol]
    : props.field;
  if (prop.kind === 'child') {
    return;
  }

  if (
    prop.kind === 'conditional' ||
    prop.kind === 'form' ||
    prop.kind === 'object' ||
    prop.kind === 'relationship' ||
    prop.kind === 'array'
  ) {
    if (prop.preview) {
      return <prop.preview {...props} />;
    }
    return;
  }

  assertNever(prop);
}

const SortableItemInForm = memo(function SortableItemInForm(
  props: PreviewProps<ArrayField<ComponentPropField>>['elements'][number]
) {
  return (
    <SortableItem id={props.id}>
      <Stack across align="center" gap="small" css={{ justifyContent: 'center' }}>
        <DragHandle />
      </Stack>
      <FormValueContentFromPreview {...(props.element as any)} />s
    </SortableItem>
  );
});
