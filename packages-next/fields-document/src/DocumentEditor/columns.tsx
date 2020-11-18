/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { Editor, Element, Node, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlate } from 'slate-react';

import { Hoverable } from './components/hoverable';
import { Button } from './components';
import { paragraphElement } from './paragraphs';
import { isBlockActive, moveChildren } from './utils';

const COLUMN_LAYOUTS: [number, ...number[]][] = [
  [1, 2],
  [1, 1],
  [2, 1],
  [1, 1, 1],
  [1, 1, 2],
  [1, 2, 1],
  [2, 1, 1],
];

// UI Components
const ColumnContainer = ({ attributes, children, element }: RenderElementProps) => {
  const focused = useFocused();
  const selected = useSelected();
  const editor = useSlate();
  const layout = element.layout as number[];
  return (
    <div
      css={{
        display: 'grid',
        margin: '8px 0',
        gridTemplateColumns: layout.map(x => `${x}fr`).join(' '),
        position: 'relative',
        columnGap: 4,
      }}
      {...attributes}
    >
      {children}
      {focused && selected && (
        <Hoverable>
          {COLUMN_LAYOUTS.map((layoutOption, i) => (
            <Button
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
              {layoutOption.join(':')}
            </Button>
          ))}
          <Button
            onMouseDown={event => {
              event.preventDefault();
              const path = ReactEditor.findPath(editor, element);
              Transforms.removeNodes(editor, { at: path });
            }}
          >
            Remove
          </Button>
        </Hoverable>
      )}
    </div>
  );
};

// Single Columns
const Column = ({ attributes, children }: RenderElementProps) => (
  <div
    css={{
      border: '3px dashed #E2E8F0',
      borderRadius: 4,
      padding: 4,
    }}
    {...attributes}
  >
    {children}
  </div>
);

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
export const insertColumns = (editor: ReactEditor) => {
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
          layout: COLUMN_LAYOUTS[0],
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
        layout = COLUMN_LAYOUTS[0];
        Transforms.setNodes(editor, { layout }, { at: path });
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
