import { useKeystone } from '@keystone-next/admin-ui/context';
import { RelationshipSelect } from '@keystone-next/fields/types/relationship/views/RelationshipSelect';
import { Stack } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import React, { Fragment, useState } from 'react';
import { ComponentPropField, RelationshipData, ComponentBlock } from '../../component-blocks';
import { useDocumentFieldRelationships, Relationships } from '../relationship';
import { assertNever, getPropsForConditionalChange } from './utils';
import { Button as KeystoneUIButton } from '@keystone-ui/button';

function FormValueContent({
  props,
  path,
  value,
  onChange,
  stringifiedPropPathToAutoFocus,
  forceValidation,
}: {
  path: (string | number)[];
  props: Record<string, ComponentPropField>;
  value: any;
  onChange(value: any): void;
  stringifiedPropPathToAutoFocus: string;
  forceValidation: boolean;
}) {
  const relationships = useDocumentFieldRelationships();
  const keystone = useKeystone();
  return (
    <Stack gap="xlarge">
      {Object.keys(props).map(key => {
        const prop = props[key];
        if (prop.kind === 'child') return null;
        if (prop.kind === 'object') {
          return (
            <FormValueContent
              forceValidation={forceValidation}
              stringifiedPropPathToAutoFocus={stringifiedPropPathToAutoFocus}
              key={key}
              path={path.concat(key)}
              props={prop.value}
              value={value[key]}
              onChange={val => {
                onChange({ ...value, [key]: val });
              }}
            />
          );
        }
        if (prop.kind === 'conditional') {
          const newPath = path.concat(key);
          return (
            <FormValueContent
              forceValidation={forceValidation}
              stringifiedPropPathToAutoFocus={stringifiedPropPathToAutoFocus}
              key={key}
              path={newPath}
              props={{
                discriminant: prop.discriminant,
                value: prop.values[value[key].discriminant],
              }}
              value={value[key]}
              onChange={val => {
                onChange({
                  ...value,
                  [key]: getPropsForConditionalChange(val, value[key], prop, relationships),
                });
              }}
            />
          );
        }
        if (prop.kind === 'relationship') {
          const relationship = relationships[prop.relationship] as Extract<
            Relationships[string],
            { kind: 'prop' }
          >;
          const stringifiedPath = JSON.stringify(path.concat(key));
          const relationshipValue = value[key];
          return (
            <FieldContainer key={key}>
              <FieldLabel>{prop.label}</FieldLabel>
              <RelationshipSelect
                autoFocus={stringifiedPath === stringifiedPropPathToAutoFocus}
                controlShouldRenderValue
                isDisabled={false}
                list={keystone.adminMeta.lists[relationship.listKey]}
                extraSelection={relationship.selection || ''}
                state={
                  relationship.many
                    ? {
                        kind: 'many',
                        value: (relationshipValue as RelationshipData[]).map(x => ({
                          id: x.id,
                          label: x.label || x.id,
                          data: x.data,
                        })),
                        onChange(data) {
                          onChange({
                            ...value,
                            [key]: data,
                          });
                        },
                      }
                    : {
                        kind: 'one',
                        value: relationshipValue
                          ? {
                              ...(relationshipValue as RelationshipData),
                              label:
                                (relationshipValue as RelationshipData).label ||
                                (relationshipValue as RelationshipData).id,
                            }
                          : null,
                        onChange(data) {
                          onChange({
                            ...value,
                            [key]: data,
                          });
                        },
                      }
                }
              />
            </FieldContainer>
          );
        }
        const newPath = path.concat(key);
        return (
          <Fragment key={key}>
            <prop.Input
              autoFocus={JSON.stringify(newPath) === stringifiedPropPathToAutoFocus}
              value={value[key]}
              onChange={newVal => {
                onChange({ ...value, [key]: newVal });
              }}
              forceValidation={forceValidation && !prop.validate(value[key])}
            />
          </Fragment>
        );
      })}
    </Stack>
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
        props={componentBlock.props}
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
