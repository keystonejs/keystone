import { useKeystone } from '@keystone-6/core/admin-ui/context';
import { RelationshipSelect } from '@keystone-6/core/fields/types/relationship/views/RelationshipSelect';
import { Stack } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import React, { memo, ReactElement, useCallback, useMemo, useState } from 'react';
import { Button as KeystoneUIButton } from '@keystone-ui/button';
import { ComponentPropField, RelationshipData } from '../../component-blocks';
import { assertNever, getPropsForConditionalChange, PropPath, ReadonlyPropPath } from './utils';
import { ArrayFormValueContent } from './array-form-value';
import { FormField, PreviewProps, RelationshipField } from './api';
import { getPreviewPropsForProp } from './preview-props';

function RelationshipFormInput({
  prop,
  path,
  value,
  onChange,
  stringifiedPropPathToAutoFocus,
}: ComponentFieldProps<RelationshipField<boolean>>) {
  const keystone = useKeystone();
  const stringifiedPath = JSON.stringify(path);
  return (
    <FieldContainer>
      <FieldLabel>{prop.label}</FieldLabel>
      <RelationshipSelect
        autoFocus={stringifiedPath === stringifiedPropPathToAutoFocus}
        controlShouldRenderValue
        isDisabled={false}
        list={keystone.adminMeta.lists[prop.listKey]}
        extraSelection={prop.selection || ''}
        portalMenu
        state={
          prop.many
            ? {
                kind: 'many',
                value: (value as RelationshipData[]).map(x => ({
                  id: x.id,
                  label: x.label || x.id,
                  data: x.data,
                })),
                onChange: val => onChange(() => val),
              }
            : {
                kind: 'one',
                value: value
                  ? {
                      ...(value as RelationshipData),
                      label: (value as RelationshipData).label || (value as RelationshipData).id,
                    }
                  : null,
                onChange: val => onChange(() => val),
              }
        }
      />
    </FieldContainer>
  );
}

export type ComponentFieldProps<Field extends ComponentPropField> = {
  path: ReadonlyPropPath;
  prop: Field;
  value: GeneralValuesForFields[Field['kind']];
  onChange(
    cb: (val: GeneralValuesForFields[Field['kind']]) => GeneralValuesForFields[Field['kind']]
  ): void;
  onAddArrayItem: (path: ReadonlyPropPath) => void;
  stringifiedPropPathToAutoFocus: string;
  forceValidation: boolean;
};

type GeneralValuesForFields = {
  array: readonly unknown[];
  relationship: null | RelationshipData | readonly RelationshipData[];
  child: undefined;
  form: unknown;
  object: Record<string, unknown>;
  conditional: { discriminant: string | boolean; value: unknown };
};

const fieldRenderers: {
  [Key in ComponentPropField['kind']]: (
    props: ComponentFieldProps<Extract<ComponentPropField, { kind: Key }>>
  ) => ReactElement | null;
} = {
  array: ArrayFormValueContent,
  relationship: RelationshipFormInput,
  child: () => null,
  form: function FormField(props) {
    const { onChange } = props;
    return (
      <props.prop.Input
        autoFocus={JSON.stringify(props.path) === props.stringifiedPropPathToAutoFocus}
        value={props.value}
        onChange={useCallback(
          val => {
            onChange(() => val);
          },
          [onChange]
        )}
        forceValidation={props.forceValidation && !props.prop.validate(props.value)}
      />
    );
  },
  object: function ObjectField(props) {
    const { onChange, prop, path } = props;
    const onChangeAndPaths = useMemo(() => {
      return Object.fromEntries(
        Object.keys(prop.value).map(key => {
          return [
            key,
            {
              onChange: (cb: (val: unknown) => unknown) => {
                onChange(value => ({ ...value, [key]: cb(value[key]) }));
              },
              path: path.concat(key),
            },
          ];
        })
      );
    }, [onChange, prop, path]);
    return (
      <Stack gap="xlarge">
        {Object.entries(prop.value).map(([key, propVal]) => (
          <FormValueContent
            key={key}
            forceValidation={props.forceValidation}
            stringifiedPropPathToAutoFocus={props.stringifiedPropPathToAutoFocus}
            path={onChangeAndPaths[key].path}
            prop={propVal}
            value={props.value[key]}
            onChange={onChangeAndPaths[key].onChange}
            onAddArrayItem={props.onAddArrayItem}
          />
        ))}
      </Stack>
    );
  },
  conditional: function ConditionalField(props) {
    const { onChange, prop, path } = props;
    const discriminant = props.prop.discriminant as FormField<string | boolean, unknown>;
    const onDiscriminantChange = useCallback(
      discriminant => {
        onChange(value =>
          getPropsForConditionalChange({ discriminant, value: value.value }, value, prop)
        );
      },
      [prop, onChange]
    );
    const discriminantAutoFocus =
      JSON.stringify(path.concat('discriminant')) === props.stringifiedPropPathToAutoFocus;
    return (
      <Stack gap="xlarge">
        {useMemo(
          () => (
            <discriminant.Input
              autoFocus={discriminantAutoFocus}
              value={props.value.discriminant}
              onChange={onDiscriminantChange}
              forceValidation={
                props.forceValidation && !discriminant.validate(props.value.discriminant)
              }
            />
          ),
          [
            discriminant,
            discriminantAutoFocus,
            props.value.discriminant,
            props.forceValidation,
            onDiscriminantChange,
          ]
        )}
        <FormValueContent
          forceValidation={props.forceValidation}
          stringifiedPropPathToAutoFocus={props.stringifiedPropPathToAutoFocus}
          path={useMemo(() => path.concat('value'), [path])}
          prop={prop.values[props.value.discriminant.toString()]}
          value={props.value.value}
          onChange={useCallback(
            val => {
              onChange(value => {
                return { discriminant: value.discriminant, value: val(value.value) };
              });
            },
            [onChange]
          )}
          onAddArrayItem={props.onAddArrayItem}
        />
      </Stack>
    );
  },
};

export const FormValueContent = memo(function FormValueContent(
  props: ComponentFieldProps<ComponentPropField>
) {
  const preview = handlePreview(props);
  if (preview !== undefined) {
    return preview;
  }
  const Comp = fieldRenderers[props.prop.kind];
  return <Comp {...(props as any)} />;
});

function handlePreview(props: ComponentFieldProps<ComponentPropField>) {
  if (props.prop.kind === 'child') {
    return;
  }

  if (
    props.prop.kind === 'conditional' ||
    props.prop.kind === 'form' ||
    props.prop.kind === 'object' ||
    props.prop.kind === 'relationship' ||
    props.prop.kind === 'array'
  ) {
    if (props.prop.preview) {
      return <PreviewWrapper {...props} prop={props.prop} />;
    }
    return;
  }

  assertNever(props.prop);
}

function PreviewWrapper(
  props: ComponentFieldProps<
    Extract<
      ComponentPropField,
      { kind: 'conditional' | 'form' | 'object' | 'relationship' | 'array' }
    >
  >
) {
  const Preview = props.prop.preview as (
    props: PreviewProps<ComponentPropField>
  ) => ReactElement | null;
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      {isOpen ? (
        <FormValueInsidePreviewBit
          {...props}
          onClose={() => {
            setIsOpen(false);
          }}
        />
      ) : (
        <Preview
          {...getPreviewPropsForProp(
            props.prop,
            props.value,
            {},
            props.path,
            newVal => props.onChange(() => newVal),
            props.onAddArrayItem
          )}
        />
      )}
    </div>
  );
}

export function findFirstFocusablePropPath(
  prop: ComponentPropField,
  path: PropPath,
  value: any
): PropPath | undefined {
  if (prop.kind === 'form' || prop.kind === 'relationship') {
    return path;
  }
  if (prop.kind === 'conditional') {
    return path.concat('discriminant');
  }
  if (prop.kind === 'child') {
    return undefined;
  }
  if (prop.kind === 'object') {
    for (const [key, innerProp] of Object.entries(prop.value)) {
      const newPath = path.concat(key);
      const childFocusable = findFirstFocusablePropPath(innerProp, newPath, value[key]);
      if (childFocusable) {
        return childFocusable;
      }
    }
    return undefined;
  }
  if (prop.kind === 'array') {
    for (const [idx, val] of (value as any[]).entries()) {
      const newPath = path.concat(idx);
      const childFocusable = findFirstFocusablePropPath(prop.element, newPath, val);
      if (childFocusable) {
        return childFocusable;
      }
    }
    return undefined;
  }
  assertNever(prop);
}

export function FormValueInsidePreviewBit({
  onClose,
  ...props
}: { onClose(): void } & ComponentFieldProps<ComponentPropField>) {
  const Comp = fieldRenderers[props.prop.kind];

  return (
    <Stack gap="xlarge" contentEditable={false}>
      <Comp {...(props as any)} />;
      <KeystoneUIButton
        size="small"
        tone="active"
        weight="bold"
        onClick={() => {
          onClose();
        }}
      >
        Done
      </KeystoneUIButton>
    </Stack>
  );
}

const basePath: PropPath = [];

export function FormValue({
  value,
  onClose,
  onChange,
  componentBlockProps,
  isValid,
  onAddArrayItem,
}: {
  value: any;
  onChange(cb: (val: any) => any): void;
  onClose(): void;
  componentBlockProps: Record<string, ComponentPropField>;
  isValid: boolean;
  onAddArrayItem(path: ReadonlyPropPath): void;
}) {
  const [forceValidation, setForceValidation] = useState(false);
  const rootProp = useMemo(
    () => ({ kind: 'object' as const, value: componentBlockProps }),
    [componentBlockProps]
  );
  const focusablePath = JSON.stringify(findFirstFocusablePropPath(rootProp, basePath, value));
  return (
    <Stack gap="xlarge" contentEditable={false}>
      <FormValueContent
        forceValidation={forceValidation}
        onChange={onChange}
        path={basePath}
        prop={rootProp}
        value={value}
        stringifiedPropPathToAutoFocus={focusablePath}
        onAddArrayItem={onAddArrayItem}
      />
      <KeystoneUIButton
        size="small"
        tone="active"
        weight="bold"
        onClick={() => {
          if (isValid) {
            onClose();
          } else {
            setForceValidation(true);
          }
        }}
      >
        Done
      </KeystoneUIButton>
    </Stack>
  );
}
