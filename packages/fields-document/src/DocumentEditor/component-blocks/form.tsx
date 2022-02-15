import { useKeystone } from '@keystone-6/core/admin-ui/context';
import { RelationshipSelect } from '@keystone-6/core/fields/types/relationship/views/RelationshipSelect';
import { Stack } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import React, { memo, ReactElement, useCallback, useMemo, useState } from 'react';
import { Button as KeystoneUIButton } from '@keystone-ui/button';
import { ComponentPropField, RelationshipData } from '../../component-blocks';
import { useDocumentFieldRelationships, Relationships } from '../relationship';
import { assertNever, getPropsForConditionalChange } from './utils';
import { ArrayFormValueContent } from './array-form-value';
import { FormField, RelationshipField } from './api';

function RelationshipFormInput({
  prop,
  path,
  value,
  onChange,
  stringifiedPropPathToAutoFocus,
}: ComponentFieldProps<RelationshipField<'many' | 'one'>>) {
  const relationships = useDocumentFieldRelationships();
  const keystone = useKeystone();
  const relationship = relationships[prop.relationship] as Extract<
    Relationships[string],
    { kind: 'prop' }
  >;
  const stringifiedPath = JSON.stringify(path);
  return (
    <FieldContainer>
      <FieldLabel>{prop.label}</FieldLabel>
      <RelationshipSelect
        autoFocus={stringifiedPath === stringifiedPropPathToAutoFocus}
        controlShouldRenderValue
        isDisabled={false}
        list={keystone.adminMeta.lists[relationship.listKey]}
        extraSelection={relationship.selection || ''}
        portalMenu
        state={
          relationship.many
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
  path: readonly (string | number)[];
  prop: Field;
  // ExtractPropFromComponentPropFieldForRendering is not exactly correct
  // (specifically it's wrong for child fields)
  // but it's correct enough to be helpful and child fields do nothing here
  value: GeneralValuesForFields[Field['kind']];
  onChange(
    cb: (val: GeneralValuesForFields[Field['kind']]) => GeneralValuesForFields[Field['kind']]
  ): void;
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
          />
        ))}
      </Stack>
    );
  },
  conditional: function ConditionalField(props) {
    const relationships = useDocumentFieldRelationships();
    const { onChange, prop, path } = props;
    const discriminant = props.prop.discriminant as FormField<string | boolean, unknown>;
    const onDiscriminantChange = useCallback(
      discriminant => {
        onChange(value =>
          getPropsForConditionalChange(
            { discriminant, value: value.value },
            value,
            prop,
            relationships
          )
        );
      },
      [prop, onChange, relationships]
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
        />
      </Stack>
    );
  },
};

export const FormValueContent = memo(function FormValueContent(
  props: ComponentFieldProps<ComponentPropField>
) {
  const Comp = fieldRenderers[props.prop.kind];
  return <Comp {...(props as any)} />;
});

export function findFirstFocusablePropPath(
  prop: ComponentPropField,
  path: (string | number)[],
  value: any
): (string | number)[] | undefined {
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
      const childFocusable = findFirstFocusablePropPath(prop, newPath, val);
      if (childFocusable) {
        return childFocusable;
      }
    }
    return undefined;
  }
  assertNever(prop);
}

const basePath: (string | number)[] = [];

export function FormValue({
  value,
  onClose,
  onChange,
  componentBlockProps,
  isValid,
}: {
  value: any;
  onChange(cb: (val: any) => any): void;
  onClose(): void;
  componentBlockProps: Record<string, ComponentPropField>;
  isValid: boolean;
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
