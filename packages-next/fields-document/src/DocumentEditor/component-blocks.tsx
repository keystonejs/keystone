/** @jsx jsx */

import { jsx, Stack } from '@keystone-ui/core';
import { ReactElement, useContext, useState } from 'react';
import { ReactEditor, RenderElementProps, useSlate } from 'slate-react';
import { Editor, Element, Transforms } from 'slate';

import { Button, Spacer } from './components';
import { ComponentPropField, ComponentBlock, NotEditable } from '../component-blocks';
import { Button as KeystoneUIButton } from '@keystone-ui/button';
import React from 'react';

const ComponentBlockContext = React.createContext<null | Record<string, ComponentBlock>>(null);

export const ComponentBlockProvider = ComponentBlockContext.Provider;

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

function findInlinePropPaths(
  value: Record<string, any>,
  props: Record<string, ComponentPropField>,
  path: (string | number)[]
) {
  let paths: (string | number)[][] = [];
  Object.keys(props).forEach(key => {
    const val = props[key];
    if (val.kind === 'form') {
    } else if (val.kind === 'inline') {
      paths.push(path.concat(key));
    } else if (val.kind === 'object') {
      paths.push(...findInlinePropPaths(value[key], val.value, path.concat(key)));
    } else if (val.kind === 'conditional') {
      paths.push(
        ...findInlinePropPaths(
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

function insertInitialValues(
  blockProps: Record<string, any>,
  props: Record<string, ComponentPropField>,
  children: Element[],
  path: (string | number)[]
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
      insertInitialValues(blockProps[key], val.value, children, path.concat(key));
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
        path.concat(key)
      );
    } else {
      assertNever(val);
    }
  });
}

function getInitialValue(type: string, componentBlock: ComponentBlock) {
  let blockProps: any = {};
  let children: Element[] = [];

  insertInitialValues(blockProps, componentBlock.props, children, []);
  return {
    type: 'component-block',
    component: type,
    props: blockProps,
    children,
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
                blockComponents[node.component as string].props,
                []
              ).map(x => JSON.stringify(x))
            )
          : undefined;

      for (const childNode of node.children) {
        const childPath = [...path, index];
        index++;
        if (node.type === 'component-block') {
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
        findInlinePropPaths(node.props as any, componentBlock.props, []).map(x => JSON.stringify(x))
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
  return (
    <span>
      {Object.keys(blockComponents).map(key => (
        <Button
          key={key}
          isDisabled={!shouldInsertBlock}
          onMouseDown={event => {
            event.preventDefault();
            Transforms.insertNodes(editor, getInitialValue(key, (blockComponents as any)[key]), {
              select: true,
            });
          }}
        >
          + {key.charAt(0).toUpperCase() + key.slice(1)}
        </Button>
      ))}
    </span>
  );
};

function buildPreviewProps(
  previewProps: Record<string, any>,
  props: ComponentBlock['props'],
  formProps: Record<string, any>,
  childrenByPath: Record<string, ReactElement>,
  path: (string | number)[]
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
        path.concat(key)
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
        path.concat(key)
      );
    } else {
      assertNever(val);
    }
  });
}

export const ComponentBlocksElement = ({
  attributes,
  children: _children,
  element,
}: RenderElementProps) => {
  const editor = useSlate();
  const [editMode, setEditMode] = useState(false);
  const previewProps: any = {};
  const childrenByPath: Record<string, ReactElement> = {};
  const children = _children.type(_children.props).props.children;
  children.forEach((child: ReactElement) => {
    childrenByPath[JSON.stringify(child.props.element.propPath)] = child;
  });
  const blockComponents = useContext(ComponentBlockContext)!;
  const componentBlock = blockComponents[element.component as string];
  buildPreviewProps(previewProps, componentBlock.props, element.props as any, childrenByPath, []);

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
          <div css={{ padding: 4 }}>
            {(element.component as string).charAt(0).toUpperCase() +
              (element.component as string).slice(1)}
          </div>
        </div>
      </NotEditable>
      {editMode && (
        <FormValue
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
        <componentBlock.component {...previewProps} />
      </div>
    </div>
  );
};

function FormValueContent({
  props,
  path,
  value,
  onChange,
}: {
  path: (string | number)[];
  props: Record<string, ComponentPropField>;
  value: any;
  onChange(value: any): void;
}) {
  return (
    <Stack gap="medium">
      {Object.keys(props).map(key => {
        const prop = props[key];
        if (prop.kind === 'inline') return null;
        if (prop.kind === 'object') {
          return (
            <FormValueContent
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
                  // we're not gonna do anything with this, normalizeNode will fix it
                  let children: Element[] = [];

                  insertInitialValues(
                    blockProps,
                    { value: prop.values[val.discriminant] },
                    children,
                    path.concat(key)
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
        return (
          <div key={key}>
            <prop.Input
              path={path.concat(key)}
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

function FormValue({
  value,
  onClose,
  onChange,
  componentBlock,
}: {
  value: any;
  onChange(value: any): void;
  onClose(): void;
  componentBlock: ComponentBlock;
}) {
  return (
    <Stack gap="medium" padding="small" contentEditable={false}>
      <FormValueContent onChange={onChange} path={[]} props={componentBlock.props} value={value} />
      <KeystoneUIButton onClick={onClose}>Done</KeystoneUIButton>
    </Stack>
  );
}
