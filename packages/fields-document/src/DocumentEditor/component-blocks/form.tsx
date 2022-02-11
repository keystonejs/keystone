import { useKeystone } from '@keystone-6/core/admin-ui/context';
import { RelationshipSelect } from '@keystone-6/core/fields/types/relationship/views/RelationshipSelect';
import { Stack } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import React, { useState } from 'react';
import { Button as KeystoneUIButton } from '@keystone-ui/button';
import { ComponentPropField, RelationshipData } from '../../component-blocks';
import { useDocumentFieldRelationships, Relationships } from '../relationship';
import { assertNever, getPropsForConditionalChange } from './utils';
import { RelationshipField } from './api';
import { ArrayFormValueContent } from './array-form-value';

// this is in a different component to the other form inputs because it uses useKeystone
// and we want to render the editor outside of the Admin UI on the docs site
// and a call to useKeystone will break on the docs site
function RelationshipFormInput({
  prop,
  path,
  value,
  onChange,
  stringifiedPropPathToAutoFocus,
}: {
  path: (string | number)[];
  prop: RelationshipField<any>;
  value: any;
  onChange(value: any): void;
  stringifiedPropPathToAutoFocus: string;
}) {
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
                onChange,
              }
            : {
                kind: 'one',
                value: value
                  ? {
                      ...(value as RelationshipData),
                      label: (value as RelationshipData).label || (value as RelationshipData).id,
                    }
                  : null,
                onChange,
              }
        }
      />
    </FieldContainer>
  );
}

export function FormValueContent({
  prop,
  path,
  value,
  onChange,
  stringifiedPropPathToAutoFocus,
  forceValidation,
}: {
  path: (string | number)[];
  prop: ComponentPropField;
  value: any;
  onChange(value: any): void;
  stringifiedPropPathToAutoFocus: string;
  forceValidation: boolean;
}) {
  const relationships = useDocumentFieldRelationships();
  if (prop.kind === 'child') return null;
  if (prop.kind === 'object') {
    return (
      <Stack gap="xlarge">
        {Object.entries(prop.value).map(([key, propVal]) => (
          <FormValueContent
            key={key}
            forceValidation={forceValidation}
            stringifiedPropPathToAutoFocus={stringifiedPropPathToAutoFocus}
            path={path.concat(key)}
            prop={propVal}
            value={value[key]}
            onChange={val => {
              onChange({ ...value, [key]: val });
            }}
          />
        ))}
      </Stack>
    );
  }
  if (prop.kind === 'conditional') {
    return (
      <Stack gap="xlarge">
        <prop.discriminant.Input
          autoFocus={JSON.stringify(path.concat('discriminant')) === stringifiedPropPathToAutoFocus}
          value={value.discriminant}
          onChange={discriminant => {
            onChange(
              getPropsForConditionalChange(
                { discriminant, value: value.value },
                value,
                prop,
                relationships
              )
            );
          }}
          forceValidation={forceValidation && !prop.discriminant.validate(value)}
        />
        <FormValueContent
          forceValidation={forceValidation}
          stringifiedPropPathToAutoFocus={stringifiedPropPathToAutoFocus}
          path={path.concat('value')}
          prop={prop.values[value.discriminant]}
          value={value.value}
          onChange={val => {
            onChange({ discriminant: value.discriminant, value: val });
          }}
        />
      </Stack>
    );
  }
  if (prop.kind === 'relationship') {
    return (
      <RelationshipFormInput
        prop={prop}
        path={path}
        value={value}
        onChange={onChange}
        stringifiedPropPathToAutoFocus={stringifiedPropPathToAutoFocus}
      />
    );
  }
  if (prop.kind === 'array') {
    return (
      <ArrayFormValueContent
        prop={prop}
        path={path}
        value={value}
        onChange={onChange}
        stringifiedPropPathToAutoFocus={stringifiedPropPathToAutoFocus}
        forceValidation={forceValidation}
      />
    );
  }
  return (
    <prop.Input
      autoFocus={JSON.stringify(path) === stringifiedPropPathToAutoFocus}
      value={value}
      onChange={onChange}
      forceValidation={forceValidation && !prop.validate(value)}
    />
  );
}

export function findFirstFocusablePropPath(
  prop: ComponentPropField,
  path: (string | number)[],
  value: any
): (string | number)[] | undefined {
  if (prop.kind === 'form' || prop.kind === 'relationship') {
    return path;
  }
  if (prop.kind === 'child') {
    return undefined;
  }
  if (prop.kind === 'object' || prop.kind === 'conditional') {
    const props: Record<string, ComponentPropField> =
      prop.kind === 'object'
        ? prop.value
        : {
            discriminant: prop.discriminant,
            value: prop.values[value.discriminant],
          };
    for (const key of Object.keys(props)) {
      const prop = props[key];
      const newPath = path.concat(key);
      const childFocusable = findFirstFocusablePropPath(prop, newPath, value[key]);
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

export function FormValue({
  value,
  onClose,
  onChange,
  componentBlockProps,
  isValid,
}: {
  value: any;
  onChange(value: any): void;
  onClose(): void;
  componentBlockProps: Record<string, ComponentPropField>;
  isValid: boolean;
}) {
  const [forceValidation, setForceValidation] = useState(false);
  const rootProp = { kind: 'object' as const, value: componentBlockProps };
  const focusablePath = JSON.stringify(findFirstFocusablePropPath(rootProp, [], value));
  return (
    <Stack gap="xlarge" contentEditable={false}>
      <FormValueContent
        forceValidation={forceValidation}
        onChange={onChange}
        path={[]}
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
