/** @jsx jsx */

import { Fragment, ReactElement, createContext, useContext, useState } from 'react';
import { ReactEditor, RenderElementProps, useEditor, useFocused, useSelected } from 'slate-react';
import { Editor, Element, Transforms, Range, NodeEntry, Path, Node, Text } from 'slate';

import { Stack, jsx, useTheme } from '@keystone-ui/core';
import { Button as KeystoneUIButton } from '@keystone-ui/button';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';
import { Tooltip } from '@keystone-ui/tooltip';
import { useKeystone } from '@keystone-next/admin-ui/context';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { RelationshipSelect } from '@keystone-next/fields/types/relationship/views/RelationshipSelect';

import { ConditionalField, NotEditable } from '../component-blocks';

import { InlineDialog, ToolbarButton, ToolbarGroup, ToolbarSeparator } from './primitives';
import { ComponentPropField, ComponentBlock, RelationshipData } from '../component-blocks';
import { Relationships, useDocumentFieldRelationships } from './relationship';
import { moveChildren } from './utils';

const ComponentBlockContext = createContext<null | Record<string, ComponentBlock>>(null);

export const ComponentBlockProvider = ComponentBlockContext.Provider;

export const VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP =
  '________VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP________';

export function getPlaceholderTextForPropPath(
  propPath: (number | string)[],
  fields: Record<string, ComponentPropField>,
  formProps: Record<string, any>
): string {
  const prop = propPath[0];
  const field = fields[prop];
  if (field.kind === 'relationship' || field.kind === 'form') {
    throw new Error('unexpected prop field when finding placeholder text for child prop');
  }
  if (field.kind === 'object') {
    return getPlaceholderTextForPropPath(propPath.slice(1), field.value, formProps[prop]);
  }
  if (field.kind === 'conditional') {
    return getPlaceholderTextForPropPath(
      propPath.slice(1),
      {
        value: field.values[formProps[prop].discriminant],
      },
      formProps[prop]
    );
  }
  return field.options.placeholder;
}

export function ComponentInlineProp(props: RenderElementProps) {
  return <span {...props.attributes}>{props.children}</span>;
}

function assertNever(arg: never) {
  throw new Error('expected to never be called but recieved: ' + JSON.stringify(arg));
}

function _findChildPropPaths(
  value: Record<string, any>,
  props: Record<string, ComponentPropField>,
  path: (string | number)[]
) {
  let paths: { path: (string | number)[]; kind: 'block' | 'inline' }[] = [];
  Object.keys(props).forEach(key => {
    const val = props[key];
    if (val.kind === 'form' || val.kind === 'relationship') {
    } else if (val.kind === 'child') {
      paths.push({ path: path.concat(key), kind: val.options.kind });
    } else if (val.kind === 'object') {
      paths.push(..._findChildPropPaths(value[key], val.value, path.concat(key)));
    } else if (val.kind === 'conditional') {
      paths.push(
        ..._findChildPropPaths(
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

function findChildPropPaths(
  value: Record<string, any>,
  props: Record<string, ComponentPropField>
): { path: (string | number)[]; kind: 'inline' | 'block' }[] {
  let propPaths = _findChildPropPaths(value, props, []);
  if (!propPaths.length) {
    return [{ path: [VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP], kind: 'inline' }];
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
    } else if (val.kind === 'child') {
      if (val.options.kind === 'inline') {
        children.push({
          type: 'component-inline-prop',
          propPath: path.concat(key),
          children: [{ text: '' }],
        });
      } else if (val.options.kind === 'block') {
        children.push({
          type: 'component-block-prop',
          propPath: path.concat(key),
          children: [{ type: 'paragraph', children: [{ text: '' }] }],
        });
      } else {
        assertNever(val.options);
      }
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

function getAncestorComponentBlock(
  editor: ReactEditor
):
  | { isInside: false }
  | { isInside: true; componentBlock: NodeEntry<Element>; prop: NodeEntry<Element> } {
  if (editor.selection) {
    const ancestorEntry = Editor.above(editor, {
      match: node => Editor.isBlock(editor, node) && node.type !== 'paragraph',
    });
    if (
      ancestorEntry &&
      (ancestorEntry[0].type === 'component-block-prop' ||
        ancestorEntry[0].type === 'component-inline-prop')
    ) {
      return {
        isInside: true,
        componentBlock: Editor.parent(editor, ancestorEntry[1]),
        prop: ancestorEntry,
      };
    }
  }
  return { isInside: false };
}

export function withComponentBlocks(
  blockComponents: Record<string, ComponentBlock | undefined>,
  editor: ReactEditor
) {
  const { normalizeNode, deleteBackward, insertBreak } = editor;
  editor.deleteBackward = unit => {
    if (editor.selection) {
      const ancestorComponentBlock = getAncestorComponentBlock(editor);
      if (
        ancestorComponentBlock.isInside &&
        Range.isCollapsed(editor.selection) &&
        Editor.isStart(editor, editor.selection.anchor, ancestorComponentBlock.prop[1]) &&
        ancestorComponentBlock.prop[1][ancestorComponentBlock.prop[1].length - 1] === 0
      ) {
        Transforms.unwrapNodes(editor, { at: ancestorComponentBlock.componentBlock[1] });
        return;
      }
    }
    deleteBackward(unit);
  };
  editor.insertBreak = () => {
    const ancestorComponentBlock = getAncestorComponentBlock(editor);
    if (editor.selection && ancestorComponentBlock.isInside) {
      const {
        prop: [componentPropNode, componentPropPath],
        componentBlock: [componentBlockNode, componentBlockPath],
      } = ancestorComponentBlock;
      const isLastProp =
        componentPropPath[componentPropPath.length - 1] === componentBlockNode.children.length - 1;

      if (componentPropNode.type === 'component-block-prop') {
        const [[paragraphNode, paragraphPath]] = Editor.nodes(editor, {
          match: node => node.type === 'paragraph',
        });
        const isLastParagraph =
          paragraphPath[paragraphPath.length - 1] === componentPropNode.children.length - 1;
        if (Node.string(paragraphNode) === '' && isLastParagraph) {
          if (isLastProp) {
            Transforms.moveNodes(editor, {
              at: paragraphPath,
              to: Path.next(ancestorComponentBlock.componentBlock[1]),
            });
          } else {
            // TODO: this goes to the start of the next block, is that right?
            // should we just insertBreak always here?
            Transforms.move(editor, { distance: 1, unit: 'line' });
            Transforms.removeNodes(editor, { at: paragraphPath });
          }
          return;
        }
      }
      if (componentPropNode.type === 'component-inline-prop') {
        Editor.withoutNormalizing(editor, () => {
          Transforms.splitNodes(editor, { always: true });
          const splitNodePath = Path.next(componentPropPath);
          if (isLastProp) {
            Transforms.moveNodes(editor, {
              at: splitNodePath,
              to: Path.next(componentBlockPath),
            });
          } else {
            moveChildren(editor, splitNodePath, [...Path.next(splitNodePath), 0]);
            Transforms.removeNodes(editor, { at: splitNodePath });
          }
        });
        return;
      }
    }
    insertBreak();
  };

  editor.normalizeNode = entry => {
    const [node, path] = entry;
    if (Element.isElement(node) || Editor.isEditor(node)) {
      if (
        node.type === 'component-inline-prop' &&
        node.propPath &&
        (node.propPath as any).length === 1 &&
        (node.propPath as any)[0] === VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP &&
        (node.children.length !== 1 ||
          !Text.isText(node.children[0]) ||
          node.children[0].text !== '')
      ) {
        Transforms.removeNodes(editor, {
          at: path,
        });
        return;
      }
      if (
        node.type === 'component-block' &&
        // we don't want to break a block component if the component doesn't exist for some reason
        blockComponents[node.component as string] !== undefined
      ) {
        let foundProps = new Set<string>();

        let stringifiedInlinePropPaths = Object.fromEntries(
          findChildPropPaths(
            node.props as any,
            blockComponents[node.component as string]!.props
          ).map(x => [JSON.stringify(x.path), x.kind as typeof x.kind | undefined])
        );

        for (const [index, childNode] of node.children.entries()) {
          if (
            // children that are not these will be handled by
            // the generic allowedChildren normalization
            childNode.type === 'component-inline-prop' ||
            childNode.type === 'component-block-prop'
          ) {
            const childPath = [...path, index];
            const stringifiedPropPath = JSON.stringify(childNode.propPath);
            if (stringifiedInlinePropPaths[stringifiedPropPath] === undefined) {
              Transforms.removeNodes(editor, { at: childPath });
              return;
            } else {
              if (foundProps.has(stringifiedPropPath)) {
                Transforms.removeNodes(editor, { at: childPath });
                return;
              }
              foundProps.add(stringifiedPropPath);
              const expectedChildNodeType = `component-${stringifiedInlinePropPaths[stringifiedPropPath]}-prop`;
              if (childNode.type !== expectedChildNodeType) {
                Transforms.setNodes(editor, { type: expectedChildNodeType }, { at: childPath });
                return;
              }
            }
          }
        }
      }
    }

    if (Element.isElement(node) && node.type === 'component-block') {
      const componentBlock = blockComponents[node.component as string];
      if (componentBlock) {
        let missingKeys = new Map(
          findChildPropPaths(node.props as any, componentBlock.props).map(x => [
            JSON.stringify(x.path),
            x.kind,
          ])
        );

        node.children.forEach(node => {
          missingKeys.delete(JSON.stringify(node.propPath));
        });
        Transforms.insertNodes(
          editor,
          [...missingKeys].map(([prop, kind]) => ({
            type: `component-${kind}-prop`,
            propPath: JSON.parse(prop),
            children: [{ text: '' }],
          })),
          { at: [...path, node.children.length] }
        );
      }
    }
    normalizeNode(entry);
  };

  return editor;
}

export function insertComponentBlock<Blocks extends Record<string, ComponentBlock>>(
  editor: Editor,
  componentBlocks: Blocks,
  componentBlock: Extract<keyof Blocks, string>,
  relationships: Relationships
) {
  let { node, isFakeVoid } = getInitialValue(
    componentBlock,
    componentBlocks[componentBlock],
    relationships
  );
  Transforms.insertNodes(editor, node);
  if (!isFakeVoid && editor.selection) {
    const [entry] = Editor.nodes(editor, {
      match: node => node.type === 'component-block',
    });
    if (entry) {
      const point = Editor.start(editor, entry[1]);
      Transforms.select(editor, point);
    }
  }
}

export const BlockComponentsButtons = ({ onClose }: { onClose: () => void }) => {
  const editor = useEditor();
  const blockComponents = useContext(ComponentBlockContext)!;
  const relationships = useDocumentFieldRelationships();
  return (
    <Fragment>
      {Object.keys(blockComponents).map(key => (
        <ToolbarButton
          key={key}
          onMouseDown={event => {
            event.preventDefault();
            insertComponentBlock(editor, blockComponents, key, relationships);
            onClose();
          }}
        >
          + {blockComponents[key].label}
        </ToolbarButton>
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
  relationships: Relationships,
  // TODO: maybe replace these with things that do batching so if you set two props in succession, they'll both be applied
  onRelationshipValuesChange: (relationshipValues: RelationshipValues) => void,
  onFormPropsChange: (formProps: Record<string, any>) => void
) {
  Object.keys(props).forEach(key => {
    const val = props[key];
    if (val.kind === 'form') {
      previewProps[key] = {
        value: formProps[key],
        onChange(value: any) {
          onFormPropsChange({ ...formProps, [key]: value });
        },
        options: val.options,
      };
    } else if (val.kind === 'child') {
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
        relationships,
        onRelationshipValuesChange,
        value => {
          onFormPropsChange({ ...formProps, [key]: value });
        }
      );
    } else if (val.kind === 'conditional') {
      const newPath = path.concat(key);
      previewProps[key] = {
        discriminant: formProps[key].discriminant,
        options: val.discriminant.options,
        onChange(newDiscriminant: any) {
          onConditionalChange(
            { ...formProps[key], discriminant: newDiscriminant },
            formProps[key],
            newPath,
            relationshipValues,
            relationships,
            onRelationshipValuesChange,
            value => {
              onFormPropsChange({ ...formProps, [key]: value });
            },
            val
          );
        },
      };
      buildPreviewProps(
        previewProps[key],
        {
          value: val.values[formProps[key].discriminant],
        },
        formProps[key],
        childrenByPath,
        newPath,
        relationshipValues,
        relationships,
        onRelationshipValuesChange,
        value => {
          onFormPropsChange({ ...formProps, [key]: value });
        }
      );
    } else if (val.kind === 'relationship') {
      const relationshipPath = JSON.stringify(path.concat(key));
      const relationshipValue = relationshipValues[relationshipPath];
      previewProps[key] = {
        value: relationshipValue.data,
        onChange(value: RelationshipData | readonly RelationshipData[] | null) {
          onRelationshipValuesChange({
            ...relationshipValues,
            [relationshipPath]: {
              relationship: relationshipValue.relationship,
              data: value,
            },
          });
        },
      };
    } else {
      assertNever(val);
    }
  });
}

export const ComponentBlocksElement = ({ attributes, children, element }: RenderElementProps) => {
  // useEditor does not update when the value/selection changes.
  // that's fine for what it's being used for here
  // because we're just inserting things on events, not reading things in render
  const editor = useEditor();
  const focused = useFocused();
  const selected = useSelected();
  const [editMode, setEditMode] = useState(false);
  const { colors, fields, spacing, typography } = useTheme();
  const blockComponents = useContext(ComponentBlockContext)!;
  const componentBlock = blockComponents[element.component as string] as ComponentBlock | undefined;
  const documentFieldRelationships = useDocumentFieldRelationships();
  if (!componentBlock) {
    return (
      <div css={{ border: 'red 4px solid', padding: spacing.medium }}>
        <pre contentEditable={false} css={{ userSelect: 'none' }}>
          {`The block "${element.component}" no longer exists.

Props:

${JSON.stringify(element.props, null, 2)}

Relationships:

${JSON.stringify(element.relationships, null, 2)}


Content:`}
        </pre>
        {children}
      </div>
    );
  }
  return (
    <div
      data-with-chrome={!componentBlock.chromeless}
      css={{
        marginBottom: spacing.xlarge,
        marginTop: spacing.xlarge,

        '&[data-with-chrome=true]': {
          paddingLeft: spacing.xlarge,
          position: 'relative',

          ':before': {
            content: '" "',
            backgroundColor: editMode ? colors.linkColor : colors.border,
            borderRadius: 4,
            width: 4,
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1,
          },
        },
      }}
      {...attributes}
    >
      {!componentBlock.chromeless && (
        <NotEditable
          css={{
            color: fields.legendColor,
            display: 'block',
            fontSize: typography.fontSize.small,
            fontWeight: typography.fontWeight.bold,
            lineHeight: 1,
            marginBottom: spacing.small,
            textTransform: 'uppercase',
          }}
        >
          {componentBlock.label}
        </NotEditable>
      )}
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
      <div css={{ display: editMode ? 'none' : 'block', position: 'relative' }}>
        <ComponentBlockRender
          children={children}
          componentBlock={componentBlock}
          element={element}
        />
        {!editMode &&
          (() => {
            const toolbarProps = {};
            buildPreviewProps(
              toolbarProps,
              componentBlock.props,
              element.props as any,
              {},
              [],
              element.relationships as any,
              documentFieldRelationships,
              relationships => {
                Transforms.setNodes(
                  editor,
                  { relationships },
                  { at: ReactEditor.findPath(editor, element) }
                );
              },
              props => {
                Transforms.setNodes(
                  editor,
                  { props },
                  { at: ReactEditor.findPath(editor, element) }
                );
              }
            );
            const ChromefulToolbar = componentBlock.toolbar
              ? componentBlock.toolbar
              : DefaultToolbarWithChrome;
            const ChromelessToolbar =
              componentBlock.chromeless && componentBlock.toolbar
                ? componentBlock.toolbar
                : DefaultToolbarWithoutChrome;
            return componentBlock.chromeless ? (
              focused && selected && (
                <InlineDialog isRelative>
                  <ChromelessToolbar
                    onRemove={() => {
                      const path = ReactEditor.findPath(editor, element);
                      Transforms.removeNodes(editor, { at: path });
                    }}
                    props={toolbarProps}
                  />
                </InlineDialog>
              )
            ) : (
              <ChromefulToolbar
                onRemove={() => {
                  const path = ReactEditor.findPath(editor, element);
                  Transforms.removeNodes(editor, { at: path });
                }}
                onShowEditMode={() => {
                  setEditMode(true);
                }}
                props={toolbarProps}
              />
            );
          })()}
      </div>
    </div>
  );
};

function DefaultToolbarWithChrome({
  onShowEditMode,
  onRemove,
}: {
  onShowEditMode(): void;
  onRemove(): void;
  props: any;
}) {
  return (
    <ToolbarGroup as={NotEditable} marginTop="small">
      <ToolbarButton
        onClick={event => {
          event.preventDefault();
          onShowEditMode();
        }}
      >
        Edit
      </ToolbarButton>
      <ToolbarSeparator />
      <Tooltip content="Remove" weight="subtle">
        {attrs => (
          <ToolbarButton
            variant="destructive"
            onClick={event => {
              event.preventDefault();
              onRemove();
            }}
            {...attrs}
          >
            <Trash2Icon size="small" />
          </ToolbarButton>
        )}
      </Tooltip>
    </ToolbarGroup>
  );
}

function DefaultToolbarWithoutChrome({
  onRemove,
}: {
  onRemove(): void;
  props: Record<string, any>;
}) {
  return (
    <Tooltip content="Remove" weight="subtle">
      {attrs => (
        <ToolbarButton
          variant="destructive"
          onMouseDown={event => {
            event.preventDefault();
            onRemove();
          }}
          {...attrs}
        >
          <Trash2Icon size="small" />
        </ToolbarButton>
      )}
    </Tooltip>
  );
}

function ComponentBlockRender({
  componentBlock,
  element,
  children: _children,
}: {
  element: Element;
  componentBlock: ComponentBlock;
  children: any;
}) {
  // useEditor does not update when the value/selection changes.
  // that's fine for what it's being used for here
  // because we're just inserting things on events, not reading things in render
  const editor = useEditor();
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
    element.props as any,
    childrenByPath,
    [],
    element.relationships as any,
    useDocumentFieldRelationships(),
    relationships => {
      Transforms.setNodes(editor, { relationships }, { at: ReactEditor.findPath(editor, element) });
    },
    props => {
      Transforms.setNodes(editor, { props }, { at: ReactEditor.findPath(editor, element) });
    }
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
    <Stack gap="xlarge">
      {Object.keys(props).map(key => {
        const prop = props[key];
        if (prop.kind === 'child') return null;
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
          const newPath = path.concat(key);
          return (
            <FormValueContent
              stringifiedPropPathToAutoFocus={stringifiedPropPathToAutoFocus}
              onRelationshipValuesChange={onRelationshipValuesChange}
              relationshipValues={relationshipValues}
              key={key}
              path={newPath}
              props={{
                discriminant: prop.discriminant,
                value: prop.values[value[key].discriminant],
              }}
              value={value[key]}
              onChange={val => {
                onConditionalChange(
                  val,
                  value[key],
                  newPath,
                  relationshipValues,
                  relationships,
                  onRelationshipValuesChange,
                  newVal => {
                    onChange({ ...value, [key]: newVal });
                  },
                  prop
                );
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
          <Fragment key={key}>
            <prop.Input
              autoFocus={JSON.stringify(newPath) === stringifiedPropPathToAutoFocus}
              path={newPath}
              value={value[key]}
              onChange={newVal => {
                onChange({ ...value, [key]: newVal });
              }}
            />
          </Fragment>
        );
      })}
    </Stack>
  );
}

function onConditionalChange(
  newValue: Record<string, any>,
  oldValue: Record<string, any>,
  path: (number | string)[],
  relationshipValues: RelationshipValues,
  relationships: Relationships,
  onRelationshipValuesChange: (relationshipValues: RelationshipValues) => void,
  onChange: (formProps: Record<string, any>) => void,
  prop: ConditionalField<any, any, any>
) {
  if (newValue.discriminant !== oldValue.discriminant) {
    // we need to remove relationships that existed in the previous discriminant
    const filteredRelationshipValues: RelationshipValues = {};
    const pathToMatch = JSON.stringify(path.concat('value')).replace(/\]$/, '');
    Object.keys(relationshipValues).forEach(relationshipPath => {
      if (!relationshipPath.startsWith(pathToMatch)) {
        filteredRelationshipValues[relationshipPath] = relationshipValues[relationshipPath];
      }
    });

    let blockProps: any = {};

    // we're not gonna do anything with this, normalizeNode will fix it
    let children: Element[] = [];

    insertInitialValues(
      blockProps,
      { value: prop.values[newValue.discriminant] },
      children,
      path,
      filteredRelationshipValues,
      relationships
    );

    onRelationshipValuesChange(filteredRelationshipValues);

    onChange({
      discriminant: newValue.discriminant,
      value: blockProps.value,
    });
  } else {
    onChange(newValue);
  }
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
    <Stack gap="xlarge" contentEditable={false}>
      <FormValueContent
        onRelationshipValuesChange={onRelationshipValuesChange}
        relationshipValues={relationshipValues}
        onChange={onChange}
        path={[]}
        props={componentBlock.props}
        value={value}
        stringifiedPropPathToAutoFocus={focusablePath}
      />
      <KeystoneUIButton size="small" tone="active" weight="bold" onClick={onClose}>
        Done
      </KeystoneUIButton>
    </Stack>
  );
}
