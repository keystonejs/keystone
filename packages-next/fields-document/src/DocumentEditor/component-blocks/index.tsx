/** @jsx jsx */

import { Fragment, ReactElement, createContext, useContext, useState } from 'react';
import { ReactEditor, RenderElementProps, useFocused, useSelected } from 'slate-react';
import { Editor, Element, Transforms } from 'slate';

import { jsx, useTheme } from '@keystone-ui/core';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';
import { Tooltip } from '@keystone-ui/tooltip';

import { NotEditable } from '../../component-blocks';

import { InlineDialog, ToolbarButton, ToolbarGroup, ToolbarSeparator } from '../primitives';
import { ComponentPropField, ComponentBlock } from '../../component-blocks';
import { Relationships, useDocumentFieldRelationships } from '../relationship';
import { VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP } from './utils';
import { createPreviewProps } from './preview-props';
import { getInitialValue } from './initial-values';
import { FormValue } from './form';
import { useStaticEditor } from '../utils';

export { withComponentBlocks } from './with-component-blocks';

export const ComponentBlockContext = createContext<Record<string, ComponentBlock>>({});

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

export function insertComponentBlock(
  editor: Editor,
  componentBlocks: Record<string, ComponentBlock>,
  componentBlock: string,
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
  const editor = useStaticEditor();
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

export const ComponentBlocksElement = ({ attributes, children, element }: RenderElementProps) => {
  const editor = useStaticEditor();
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
        {editMode ? (
          children
        ) : (
          <ComponentBlockRender
            children={children}
            componentBlock={componentBlock}
            element={element}
          />
        )}
        {!editMode &&
          (() => {
            const toolbarProps = createPreviewProps(
              element,
              componentBlock,
              {},
              documentFieldRelationships,
              data => {
                Transforms.setNodes(editor, data, { at: ReactEditor.findPath(editor, element) });
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
  const editor = useStaticEditor();

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

  const previewProps = createPreviewProps(
    element,
    componentBlock,
    childrenByPath,
    useDocumentFieldRelationships(),
    data => {
      Transforms.setNodes(editor, data, { at: ReactEditor.findPath(editor, element) });
    }
  );

  return (
    <Fragment>
      <componentBlock.component {...previewProps} />
      <span css={{ display: 'none' }}>{maybeChild}</span>
    </Fragment>
  );
}
