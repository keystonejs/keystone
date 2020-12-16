/** @jsx jsx */

import { createContext, useContext, useMemo } from 'react';
import { Editor, Element, Node, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlate } from 'slate-react';

import { jsx, useTheme } from '@keystone-ui/core';
import { Tooltip } from '@keystone-ui/tooltip';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';

import { InlineDialog, ToolbarButton, ToolbarGroup, ToolbarSeparator } from './primitives';
import { paragraphElement } from './paragraphs';
import { isBlockActive, moveChildren } from './utils';
import { DocumentFeatures } from '../views';
import { ColumnsIcon } from '@keystone-ui/icons/icons/ColumnsIcon';

const ColumnOptionsContext = createContext<[number, ...number[]][]>([]);

export const ColumnOptionsProvider = ColumnOptionsContext.Provider;

// UI Components
const ColumnContainer = ({ attributes, children, element }: RenderElementProps) => {
  const { spacing } = useTheme();
  const focused = useFocused();
  const selected = useSelected();
  const editor = useSlate();
  const layout = element.layout as number[];
  const columnLayouts = useContext(ColumnOptionsContext);

  return (
    <div
      css={{
        marginBottom: spacing.medium,
        marginTop: spacing.medium,
        position: 'relative',
      }}
      {...attributes}
    >
      <div
        css={{
          columnGap: spacing.small,
          display: 'grid',
          gridTemplateColumns: layout.map(x => `${x}fr`).join(' '),
        }}
      >
        {children}
      </div>
      {focused && selected && (
        <InlineDialog isRelative>
          <ToolbarGroup>
            {columnLayouts.map((layoutOption, i) => (
              <ToolbarButton
                isSelected={layoutOption.toString() === layout.toString()}
                key={i}
                onMouseDown={event => {
                  event.preventDefault();
                  const path = ReactEditor.findPath(editor, element);
                  const cols = {
                    type: 'columns',
                    layout: layoutOption,
                  };
                  Transforms.setNodes(editor, cols, { at: path });
                }}
              >
                {makeLayoutIcon(layoutOption)}
              </ToolbarButton>
            ))}
            <ToolbarSeparator />
            <Tooltip content="Remove" weight="subtle">
              {attrs => (
                <ToolbarButton
                  variant="destructive"
                  onMouseDown={event => {
                    event.preventDefault();
                    const path = ReactEditor.findPath(editor, element);
                    Transforms.removeNodes(editor, { at: path });
                  }}
                  {...attrs}
                >
                  <Trash2Icon size="small" />
                </ToolbarButton>
              )}
            </Tooltip>
          </ToolbarGroup>
        </InlineDialog>
      )}
    </div>
  );
};

// Single Columns
const Column = ({ attributes, children }: RenderElementProps) => {
  const { colors, radii, spacing } = useTheme();
  return (
    <div
      css={{
        border: `2px dashed ${colors.border}`,
        borderRadius: radii.small,
        paddingLeft: spacing.medium,
        paddingRight: spacing.medium,
      }}
      {...attributes}
    >
      {children}
    </div>
  );
};

export const isInsideColumn = (editor: ReactEditor) => {
  return isBlockActive(editor, 'columns');
};

function firstNonEditorRootNodeEntry(editor: Editor) {
  for (const entry of Editor.nodes(editor, {
    reverse: true,
  })) {
    if (
      Element.isElement(entry[0]) &&
      // is a child of the editor
      entry[1].length === 1
    ) {
      return entry;
    }
  }
}

// Helper function
export const insertColumns = (editor: ReactEditor, layout: [number, ...number[]]) => {
  if (isInsideColumn(editor)) {
    Transforms.unwrapNodes(editor, {
      match: node => node.type === 'columns',
    });
    return;
  }
  const entry = firstNonEditorRootNodeEntry(editor);
  if (entry) {
    Transforms.insertNodes(
      editor,
      [
        {
          type: 'columns',
          layout,
          children: [
            {
              type: 'column',
              children: [paragraphElement()],
            },
            {
              type: 'column',
              children: [paragraphElement()],
            },
          ],
        },
      ],
      { at: [entry[1][0] + 1] }
    );
    Transforms.select(editor, [entry[1][0] + 1, 0]);
  }
};

export const renderColumnsElement = (props: RenderElementProps) => {
  switch (props.element.type) {
    case 'columns':
      return <ColumnContainer {...props} />;
    case 'column':
      return <Column {...props} />;
  }
};

// Plugin
export const withColumns = (editor: ReactEditor) => {
  const { normalizeNode } = editor;
  editor.normalizeNode = entry => {
    const [node, path] = entry;

    if (Element.isElement(node) || Editor.isEditor(node)) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        const childPath = [...path, i];
        const childNode = node.children[i];
        if (childNode.type === 'columns' && Element.isElement(node)) {
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }
        if (childNode.type === 'column' && node.type !== 'columns') {
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }
      }
    }

    if (Element.isElement(node) && node.type === 'columns') {
      let layout = node.layout as number[];
      if (node.layout === undefined) {
        Transforms.unwrapNodes(editor, { at: path });
        return;
      }
      if (node.children.length < layout.length) {
        Transforms.insertNodes(
          editor,
          Array.from({
            length: layout.length - node.children.length,
          }).map(() => ({
            type: 'column',
            children: [paragraphElement()],
          })),
          {
            at: [...path, node.children.length],
          }
        );
        return;
      }
      if (node.children.length > layout.length) {
        Array.from({
          length: node.children.length - layout.length,
        }).forEach((_, i) => {
          const columnToRemovePath = [...path, i + layout.length];
          const child = node.children[i + layout.length] as Element;
          if (child.children.some(x => x.type !== 'paragraph') || Node.string(child) !== '') {
            moveChildren(editor, columnToRemovePath, [
              ...path,
              layout.length - 1,
              (node.children[layout.length - 1] as Element).children.length,
            ]);
          }

          Transforms.removeNodes(editor, {
            at: columnToRemovePath,
          });
        });
        return;
      }
    }
    normalizeNode(entry);
  };
  return editor;
};

// Utils
// ------------------------------

function makeLayoutIcon(ratios: number[]) {
  const size = 16;

  const element = (
    <div
      role="img"
      css={{
        display: 'grid',
        gridTemplateColumns: ratios.map(r => `${r}fr`).join(' '),
        gap: 2,
        width: size,
        height: size,
      }}
    >
      {ratios.map((_, i) => {
        return <div key={i} css={{ backgroundColor: 'currentcolor', borderRadius: 1 }} />;
      })}
    </div>
  );

  return element;
}

const columnsIcon = <ColumnsIcon size="small" />;

export const ColumnsButton = ({ columns }: { columns: DocumentFeatures['columns'] }) => {
  const editor = useSlate();
  const isInsideColumns = isInsideColumn(editor);
  return useMemo(
    () => (
      <Tooltip content="Columns" weight="subtle">
        {attrs => (
          <ToolbarButton
            isSelected={isInsideColumns}
            onMouseDown={event => {
              event.preventDefault();
              insertColumns(editor, columns[0]);
            }}
            {...attrs}
          >
            {columnsIcon}
          </ToolbarButton>
        )}
      </Tooltip>
    ),
    [editor, isInsideColumns, columns]
  );
};
