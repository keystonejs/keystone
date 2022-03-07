import { useKeystone } from '@keystone-6/core/admin-ui/context';
import { RelationshipSelect } from '@keystone-6/core/fields/types/relationship/views/RelationshipSelect';
import { Stack } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import React, { useState } from 'react';
import { Button as KeystoneUIButton } from '@keystone-ui/button';
import { ComponentPropField, RelationshipData, ComponentBlock } from '../../component-blocks';
import { assertNever, getPropsForConditionalChange } from './utils';
import { RelationshipField } from './api';

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
  prop: RelationshipField<boolean>;
  value: any;
  onChange(value: any): void;
  stringifiedPropPathToAutoFocus: string;
}) {
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
              getPropsForConditionalChange({ discriminant, value: value.value }, value, prop)
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
  return (
    <prop.Input
      autoFocus={JSON.stringify(path) === stringifiedPropPathToAutoFocus}
      value={value}
      onChange={onChange}
      forceValidation={forceValidation && !prop.validate(value)}
    />
  );
}

// child as in the props are a tree and you want the children of a prop, not as in the kind === 'inline'
function getChildProps(prop: ComponentPropField, value: any): Record<string, ComponentPropField> {
  if (prop.kind === 'conditional') {
    return {
      discriminant: prop.discriminant,
      value: prop.values[value.discriminant],
    };
  } else if (prop.kind === 'form' || prop.kind === 'child' || prop.kind === 'relationship') {
    return {};
  } else if (prop.kind === 'object') {
    return prop.value;
  } else {
    assertNever(prop);
    // TypeScript should understand that this will never happen but for some reason it doesn't
    return {};
  }
}

function findFirstFocusablePropPath(
  props: Record<string, ComponentPropField>,
  path: (string | number)[],
  value: Record<string, any>
): (string | number)[] | undefined {
  for (const key of Object.keys(props)) {
    const prop = props[key];
    const newPath = path.concat(key);
    if (prop.kind === 'form' || prop.kind === 'relationship') {
      return newPath;
    }
    let children = getChildProps(prop, value[key]);
    const childFocusable = findFirstFocusablePropPath(children, newPath, value[key]);
    if (childFocusable) {
      return childFocusable;
    }
  }
}

export function FormValue({
  value,
  onClose,
  onChange,
  componentBlock,
  isValid,
}: {
  value: any;
  onChange(value: any): void;
  onClose(): void;
  componentBlock: ComponentBlock;
  isValid: boolean;
}) {
  const [forceValidation, setForceValidation] = useState(false);
  const focusablePath = JSON.stringify(findFirstFocusablePropPath(componentBlock.props, [], value));
  return (
    <Stack gap="xlarge" contentEditable={false}>
      <FormValueContent
        forceValidation={forceValidation}
        onChange={onChange}
        path={[]}
        prop={{ kind: 'object', value: componentBlock.props }}
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
