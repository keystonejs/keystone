/** @jsx jsx */

import { jsx, Stack } from '@keystone-ui/core';
import { Fragment, ReactElement, useContext, useState } from 'react';
import { ReactEditor, RenderElementProps, useSlate } from 'slate-react';
import { Editor, Element, Transforms } from 'slate';

import { Button, Spacer } from './components';
import {
  ComponentPropField,
  ComponentBlock,
  NotEditable,
  RelationshipData,
} from '../component-blocks';
import { Button as KeystoneUIButton } from '@keystone-ui/button';
import React from 'react';
import { Relationships, useDocumentFieldRelationships } from './relationship';
import { RelationshipSelect } from '@keystone-next/fields/types/relationship/views/RelationshipSelect';
import { useKeystone } from '@keystone-next/admin-ui/context';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';

const ComponentBlockContext = React.createContext<null | Record<string, ComponentBlock>>(null);

export const ComponentBlockProvider = ComponentBlockContext.Provider;

const VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP =
  '________VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP________';

export function ComponentInlineProp(props: RenderElementProps) {
  return (
    <span
      css={{
        outline: 'lightblue 4px dashed',
        padding: 8,
      }}
    >
      <span {...props.attributes}>{props.children}</span>
    </span>
  );
}

function assertNever(arg: never) {
  throw new Error('expected to never be called but recieved: ' + JSON.stringify(arg));
}

function _findInlinePropPaths(
  value: Record<string, any>,
  props: Record<string, ComponentPropField>,
  path: (string | number)[]
) {
  let paths: (string | number)[][] = [];
  Object.keys(props).forEach(key => {
    const val = props[key];
    if (val.kind === 'form' || val.kind === 'relationship') {
    } else if (val.kind === 'inline') {
      paths.push(path.concat(key));
    } else if (val.kind === 'object') {
      paths.push(..._findInlinePropPaths(value[key], val.value, path.concat(key)));
    } else if (val.kind === 'conditional') {
      paths.push(
        ..._findInlinePropPaths(
          value[key],
          { value: val.values[value[key].discriminant] },
          path.concat(key)
        )
      );
    } else {
      assertNever(val);
    }
  });
  return paths;
}

function findInlinePropPaths(
  value: Record<string, any>,
  props: Record<string, ComponentPropField>
) {
  let propPaths = _findInlinePropPaths(value, props, []);
  if (!propPaths.length) {
    return [[VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP]];
  }
  return propPaths;
}

type RelationshipValues = Record<
  string,
  {
    relationship: string;
    data: RelationshipData | readonly RelationshipData[] | null;
  }
>;

function insertInitialValues(
  blockProps: Record<string, any>,
  props: Record<string, ComponentPropField>,
  children: Element[],
  path: (string | number)[],
  relationshipValues: RelationshipValues,
  relationships: Relationships
) {
  Object.keys(props).forEach(key => {
    const val = props[key];
    if (val.kind === 'form') {
      blockProps[key] = val.defaultValue;
    } else if (val.kind === 'inline') {
      children.push({
        type: 'component-inline-prop',
        propPath: path.concat(key),
        children: [{ text: '' }],
      });
    } else if (val.kind === 'object') {
      blockProps[key] = {};
      insertInitialValues(
        blockProps[key],
        val.value,
        children,
        path.concat(key),
        relationshipValues,
        relationships
      );
    } else if (val.kind === 'conditional') {
      blockProps[key] = {
        discriminant: val.discriminant.defaultValue,
      };
      insertInitialValues(
        blockProps[key],
        {
          value: (val.values as Record<string, ComponentPropField>)[val.discriminant.defaultValue],
        },
        children,
        path.concat(key),
        relationshipValues,
        relationships
      );
    } else if (val.kind === 'relationship') {
      relationshipValues[JSON.stringify(path.concat(key))] = {
        relationship: val.relationship,
        data: (relationships[val.relationship] as Extract<Relationships[string], { kind: 'prop' }>)
          .many
          ? []
          : null,
      };
    } else {
      assertNever(val);
    }
  });
}

function getInitialValue(
  type: string,
  componentBlock: ComponentBlock,
  relationships: Relationships
) {
  const blockProps: Record<string, any> = {};
  const relationshipsValues: RelationshipValues = {};
  const children: Element[] = [];

  insertInitialValues(
    blockProps,
    componentBlock.props,
    children,
    [],
    relationshipsValues,
    relationships
  );
  const isFakeVoid = !children.length;
  if (isFakeVoid) {
    children.push({
      type: 'component-inline-prop',
      propPath: JSON.stringify([VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP]),
      children: [{ text: '' }],
    });
  }
  return {
    node: {
      type: 'component-block',
      component: type,
      props: blockProps,
      relationships: relationshipsValues,
      children,
    },
    isFakeVoid,
  };
}

export function withComponentBlocks(
  blockComponents: Record<string, ComponentBlock>,
  editor: ReactEditor
) {
  const { normalizeNode } = editor;
  editor.normalizeNode = entry => {
    const [node, path] = entry;
    if (Element.isElement(node) || Editor.isEditor(node)) {
      let foundProps = new Set<string>();
      let index = 0;
      let stringifiedInlinePropPaths =
        node.type === 'component-block'
          ? new Set(
              findInlinePropPaths(
                node.props as any,
                blockComponents[node.component as string].props
              ).map(x => JSON.stringify(x))
            )
          : undefined;

      for (const childNode of node.children) {
        const childPath = [...path, index];
        index++;
        if (node.type === 'component-block' && stringifiedInlinePropPaths?.size !== 0) {
          if (childNode.type !== 'component-inline-prop') {
            Transforms.removeNodes(editor, { at: childPath });
            return;
          }
          const stringifiedPropPath = JSON.stringify(childNode.propPath);
          if (!stringifiedInlinePropPaths!.has(stringifiedPropPath)) {
            Transforms.removeNodes(editor, { at: childPath });
            return;
          } else {
            if (foundProps.has(stringifiedPropPath)) {
              Transforms.removeNodes(editor, { at: childPath });
              return;
            }
            foundProps.add(stringifiedPropPath);
          }
        } else if (childNode.type === 'component-inline-prop') {
          Transforms.removeNodes(editor, { at: childPath });
        }
      }
    }

    if (node.type === 'component-block' && Element.isElement(node)) {
      const componentBlock = blockComponents[node.component as string];
      let missingKeys = new Set(
        findInlinePropPaths(node.props as any, componentBlock.props).map(x => JSON.stringify(x))
      );

      node.children.forEach(node => {
        missingKeys.delete(JSON.stringify(node.propPath));
      });
      Transforms.insertNodes(
        editor,
        [...missingKeys].map(prop => ({
          type: 'component-inline-prop',
          propPath: JSON.parse(prop),
          children: [{ text: '' }],
        })),
        { at: [...path, node.children.length] }
      );
    }
    normalizeNode(entry);
  };

  return editor;
}

export const BlockComponentsButtons = ({ shouldInsertBlock }: { shouldInsertBlock: boolean }) => {
  const editor = useSlate();
  const blockComponents = useContext(ComponentBlockContext)!;
  const relationships = useDocumentFieldRelationships();
  return (
    <Fragment>
      {Object.keys(blockComponents).map(key => (
        <Button
          key={key}
          isDisabled={!shouldInsertBlock}
          onMouseDown={event => {
            event.preventDefault();
            let { node, isFakeVoid } = getInitialValue(
              key,
              (blockComponents as any)[key],
              relationships
            );
            Transforms.insertNodes(editor, node);
            if (!isFakeVoid && editor.selection) {
              const point = {
                offset: 0,
                path: [
                  ...editor.selection.anchor.path.slice(0, editor.selection.anchor.path.length - 2),
                  0,
                  0,
                ],
              };

              Transforms.setSelection(editor, {
                anchor: point,
                focus: point,
              });
            }
          }}
        >
          + {blockComponents[key].label}
        </Button>
      ))}
    </Fragment>
  );
};

function buildPreviewProps(
  previewProps: Record<string, any>,
  props: ComponentBlock['props'],
  formProps: Record<string, any>,
  childrenByPath: Record<string, ReactElement>,
  path: (string | number)[],
  relationshipValues: RelationshipValues,
  relationships: Relationships
) {
  Object.keys(props).forEach(key => {
    const val = props[key];
    if (val.kind === 'form') {
      previewProps[key] = formProps[key];
    } else if (val.kind === 'inline') {
      previewProps[key] = childrenByPath[JSON.stringify(path.concat(key))];
    } else if (val.kind === 'object') {
      previewProps[key] = {};
      buildPreviewProps(
        previewProps[key],
        val.value,
        formProps[key],
        childrenByPath,
        path.concat(key),
        relationshipValues,
        relationships
      );
    } else if (val.kind === 'conditional') {
      previewProps[key] = {};
      buildPreviewProps(
        previewProps[key],
        {
          discriminant: val.discriminant,
          value: val.values[formProps[key].discriminant],
        },
        formProps[key],
        childrenByPath,
        path.concat(key),
        relationshipValues,
        relationships
      );
    } else if (val.kind === 'relationship') {
      previewProps[key] = relationshipValues[JSON.stringify(path.concat(key))].data;
    } else {
      assertNever(val);
    }
  });
}

export const ComponentBlocksElement = ({ attributes, children, element }: RenderElementProps) => {
  const editor = useSlate();
  const [editMode, setEditMode] = useState(false);
  const blockComponents = useContext(ComponentBlockContext)!;
  const componentBlock = blockComponents[element.component as string];

  return (
    <div
      css={{
        margin: '8px 0',
        border: '1px solid #E2E8F0',
        borderRadius: 5,
      }}
      {...attributes}
    >
      <NotEditable>
        <div
          style={{
            backgroundColor: '#F7FAFC',
            borderBottom: '1px solid #E2E8F0',
            padding: 8,
            fontSize: 14,
            color: '#4299E1',
            fontWeight: 600,
          }}
        >
          <Button
            css={{ float: 'right' }}
            onMouseDown={event => {
              event.preventDefault();
              const path = ReactEditor.findPath(editor, element);
              Transforms.removeNodes(editor, { at: path });
            }}
          >
            Remove
          </Button>
          {!editMode ? (
            <div css={{ float: 'right' }}>
              <Button
                onMouseDown={event => {
                  event.preventDefault();
                  setEditMode(true);
                }}
              >
                Edit
              </Button>
              <Spacer />
            </div>
          ) : null}
          <div css={{ padding: 4 }}>{componentBlock.label}</div>
        </div>
      </NotEditable>
      {editMode && (
        <FormValue
          onRelationshipValuesChange={relationships => {
            Transforms.setNodes(
              editor,
              { relationships },
              { at: ReactEditor.findPath(editor, element) }
            );
          }}
          relationshipValues={element.relationships as any}
          componentBlock={componentBlock}
          onClose={() => {
            setEditMode(false);
          }}
          value={element.props as any}
          onChange={val => {
            Transforms.setNodes(
              editor,
              { props: val },
              { at: ReactEditor.findPath(editor, element) }
            );
          }}
        />
      )}
      <div css={{ display: editMode ? 'none' : 'block' }}>
        <ComponentBlockRender
          children={children}
          componentBlock={componentBlock}
          elementProps={element.props}
          relationshipValues={element.relationships as any}
        />
      </div>
    </div>
  );
};

function ComponentBlockRender({
  componentBlock,
  children: _children,
  elementProps,
  relationshipValues,
}: {
  elementProps: any;
  relationshipValues: RelationshipValues;
  componentBlock: ComponentBlock;
  children: any;
}) {
  const previewProps: any = {};

  const childrenByPath: Record<string, ReactElement> = {};
  const children = _children.type(_children.props).props.children;
  let maybeChild: ReactElement | undefined;
  children.forEach((child: ReactElement) => {
    let stringified = JSON.stringify(child.props.element.propPath);
    if (stringified === `["${VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP}"]`) {
      maybeChild = child;
    } else {
      childrenByPath[stringified] = child;
    }
  });

  buildPreviewProps(
    previewProps,
    componentBlock.props,
    elementProps,
    childrenByPath,
    [],
    relationshipValues,
    useDocumentFieldRelationships()
  );

  return (
    <Fragment>
      <componentBlock.component {...previewProps} />
      <span css={{ display: 'none' }}>{maybeChild}</span>
    </Fragment>
  );
}

function FormValueContent({
  props,
  path,
  value,
  onChange,
  relationshipValues,
  onRelationshipValuesChange,
  stringifiedPropPathToAutoFocus,
}: {
  path: (string | number)[];
  props: Record<string, ComponentPropField>;
  value: any;
  relationshipValues: RelationshipValues;
  onRelationshipValuesChange(value: RelationshipValues): void;
  onChange(value: any): void;
  stringifiedPropPathToAutoFocus: string;
}) {
  const relationships = useDocumentFieldRelationships();
  const keystone = useKeystone();
  return (
    <Stack gap="medium">
      {Object.keys(props).map(key => {
        const prop = props[key];
        if (prop.kind === 'inline') return null;
        if (prop.kind === 'object') {
          return (
            <FormValueContent
              stringifiedPropPathToAutoFocus={stringifiedPropPathToAutoFocus}
              onRelationshipValuesChange={onRelationshipValuesChange}
              relationshipValues={relationshipValues}
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
          return (
            <FormValueContent
              stringifiedPropPathToAutoFocus={stringifiedPropPathToAutoFocus}
              onRelationshipValuesChange={onRelationshipValuesChange}
              relationshipValues={relationshipValues}
              key={key}
              path={path.concat(key)}
              props={{
                discriminant: prop.discriminant,
                value: prop.values[value[key].discriminant],
              }}
              value={value[key]}
              onChange={val => {
                if (val.discriminant !== value[key].discriminant) {
                  let blockProps: any = {};
                  let relationshipValues: RelationshipValues = {};

                  // we're not gonna do anything with this, normalizeNode will fix it
                  let children: Element[] = [];

                  insertInitialValues(
                    blockProps,
                    { value: prop.values[val.discriminant] },
                    children,
                    path.concat(key),
                    relationshipValues,
                    relationships
                  );

                  onChange({
                    ...value,
                    [key]: {
                      discriminant: val.discriminant,
                      value: blockProps.value,
                    },
                  });
                } else {
                  onChange({ ...value, [key]: val });
                }
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
          const relationshipValue = relationshipValues[stringifiedPath];
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
                        value: (relationshipValue.data as RelationshipData[]).map(x => ({
                          id: x.id,
                          label: x.label || x.id,
                          data: x.data,
                        })),
                        onChange(data) {
                          onRelationshipValuesChange({
                            ...relationshipValues,
                            [stringifiedPath]: { data, relationship: prop.relationship },
                          });
                        },
                      }
                    : {
                        kind: 'one',
                        value: relationshipValue.data
                          ? {
                              ...(relationshipValue.data as RelationshipData),
                              label:
                                (relationshipValue.data as RelationshipData).label ||
                                (relationshipValue.data as RelationshipData).id,
                            }
                          : null,
                        onChange(data) {
                          onRelationshipValuesChange({
                            ...relationshipValues,
                            [stringifiedPath]: { data, relationship: prop.relationship },
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
          <div key={key}>
            <prop.Input
              autoFocus={JSON.stringify(newPath) === stringifiedPropPathToAutoFocus}
              path={newPath}
              value={value[key]}
              onChange={newVal => {
                onChange({ ...value, [key]: newVal });
              }}
            />
          </div>
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
  } else if (prop.kind === 'form' || prop.kind === 'inline' || prop.kind === 'relationship') {
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

function FormValue({
  value,
  onClose,
  onChange,
  componentBlock,
  onRelationshipValuesChange,
  relationshipValues,
}: {
  value: any;
  onChange(value: any): void;
  onClose(): void;
  componentBlock: ComponentBlock;
  relationshipValues: RelationshipValues;
  onRelationshipValuesChange(value: RelationshipValues): void;
}) {
  const focusablePath = JSON.stringify(findFirstFocusablePropPath(componentBlock.props, [], value));
  return (
    <Stack gap="medium" padding="small" contentEditable={false}>
      <FormValueContent
        onRelationshipValuesChange={onRelationshipValuesChange}
        relationshipValues={relationshipValues}
        onChange={onChange}
        path={[]}
        props={componentBlock.props}
        value={value}
        stringifiedPropPathToAutoFocus={focusablePath}
      />
      <KeystoneUIButton onClick={onClose}>Done</KeystoneUIButton>
    </Stack>
  );
}
