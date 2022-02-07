/** @jsxRuntime classic */
/** @jsx jsx */

import { Fragment, ReactElement, createContext, useContext, useState, useMemo } from 'react';
import { ReactEditor, RenderElementProps, useFocused, useSelected } from 'slate-react';
import { Editor, Element, Transforms } from 'slate';

import { jsx, useTheme } from '@keystone-ui/core';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';
import { Tooltip } from '@keystone-ui/tooltip';

import { NotEditable } from '../../component-blocks';

import { InlineDialog, ToolbarButton, ToolbarGroup, ToolbarSeparator } from '../primitives';
import { ComponentPropField, ComponentBlock } from '../../component-blocks';
import {
  insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading,
  useElementWithSetNodes,
  useStaticEditor,
} from '../utils';
import { clientSideValidateProp } from './utils';
import { createPreviewProps } from './preview-props';
import { getInitialValue } from './initial-values';
import { FormValue } from './form';

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
  componentBlock: string
) {
  let node = getInitialValue(componentBlock, componentBlocks[componentBlock]);
  insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, node);
  const componentBlockEntry = Editor.above(editor, {
    match: node => node.type === 'component-block',
  });
  if (componentBlockEntry) {
    const start = Editor.start(editor, componentBlockEntry[1]);
    Transforms.setSelection(editor, { anchor: start, focus: start });
  }
}

export const BlockComponentsButtons = ({ onClose }: { onClose: () => void }) => {
  const editor = useStaticEditor();
  const blockComponents = useContext(ComponentBlockContext)!;
  return (
    <Fragment>
      {Object.keys(blockComponents).map(key => (
        <ToolbarButton
          key={key}
          onMouseDown={event => {
            event.preventDefault();
            insertComponentBlock(editor, blockComponents, key);
            onClose();
          }}
        >
          {blockComponents[key].label}
        </ToolbarButton>
      ))}
    </Fragment>
  );
};

export const ComponentBlocksElement = ({
  attributes,
  children,
  element: __elementToGetPath,
}: RenderElementProps & { element: { type: 'component-block' } }) => {
  const editor = useStaticEditor();
  const focused = useFocused();
  const selected = useSelected();
  const [editMode, setEditMode] = useState(false);
  const [currentElement, setElement] = useElementWithSetNodes(editor, __elementToGetPath);
  const { colors, fields, spacing, typography } = useTheme();
  const blockComponents = useContext(ComponentBlockContext)!;
  const componentBlock = blockComponents[currentElement.component] as ComponentBlock | undefined;
  const isValid = useMemo(() => {
    return componentBlock
      ? clientSideValidateProp(
          { kind: 'object', value: componentBlock.props },
          currentElement.props
        )
      : true;
  }, [componentBlock, currentElement.props]);
  if (!componentBlock) {
    return (
      <div css={{ border: 'red 4px solid', padding: spacing.medium }}>
        <pre contentEditable={false} css={{ userSelect: 'none' }}>
          {`The block "${currentElement.component}" no longer exists.

Props:

${JSON.stringify(currentElement.props, null, 2)}

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
          isValid={isValid}
          componentBlock={componentBlock}
          onClose={() => {
            setEditMode(false);
          }}
          value={currentElement.props}
          onChange={val => {
            setElement({ props: val });
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
            element={currentElement}
            onElementChange={setElement}
          />
        )}
        {!editMode &&
          (() => {
            const toolbarProps = createPreviewProps(currentElement, componentBlock, {}, setElement);
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
                      const path = ReactEditor.findPath(editor, __elementToGetPath);
                      Transforms.removeNodes(editor, { at: path });
                    }}
                    props={toolbarProps}
                  />
                </InlineDialog>
              )
            ) : (
              <ChromefulToolbar
                isValid={isValid}
                onRemove={() => {
                  const path = ReactEditor.findPath(editor, __elementToGetPath);
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
  isValid,
}: {
  onShowEditMode(): void;
  onRemove(): void;
  props: any;
  isValid: boolean;
}) {
  const theme = useTheme();
  return (
    <ToolbarGroup as={NotEditable} marginTop="small">
      <ToolbarButton
        onClick={() => {
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
            onClick={() => {
              onRemove();
            }}
            {...attrs}
          >
            <Trash2Icon size="small" />
          </ToolbarButton>
        )}
      </Tooltip>
      {!isValid && (
        <Fragment>
          <ToolbarSeparator />
          <span
            css={{
              color: theme.palette.red500,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: theme.spacing.small,
            }}
          >
            Please edit the form, there are invalid fields.
          </span>
        </Fragment>
      )}
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
  onElementChange,
  children,
}: {
  element: Element & { type: 'component-block' };
  onElementChange: (element: Partial<Element>) => void;
  componentBlock: ComponentBlock;
  children: any;
}) {
  const childrenByPath: Record<string, ReactElement> = {};
  let maybeChild: ReactElement | undefined;
  children.forEach((child: ReactElement) => {
    let stringified = JSON.stringify(child.props.children.props.element.propPath);
    if (stringified === undefined) {
      maybeChild = child;
    } else {
      childrenByPath[stringified] = child;
    }
  });

  const previewProps = createPreviewProps(element, componentBlock, childrenByPath, onElementChange);

  return (
    <Fragment>
      <componentBlock.component {...previewProps} />
      <span css={{ display: 'none' }}>{maybeChild}</span>
    </Fragment>
  );
}
