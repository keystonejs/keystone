/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useCallback } from 'react';
import { Editor, Path, Point, Range, Transforms } from 'slate';
import { ReactEditor, useFocused, useSelected, useSlate } from 'slate-react';

import { Button } from './components';
import { paragraphElement } from './paragraphs';
import { debugLog, isBlockTextEmpty, getBlockAboveSelection, isBlockActive } from './utils';

// Configuration
const COLUMNS_LAYOUT = {
  two: {
    repeat: 2,
    view: [
      { layout: '1fr 1fr', icon: '50:50' },
      { layout: '2fr 1fr', icon: '65:35' },
      { layout: '1fr 2fr', icon: '35:65' },
    ],
  },
  three: {
    repeat: 3,
    view: [
      { layout: '1fr 1fr 1fr', icon: '33:33:33' },
      { layout: '1fr 1fr 2fr', icon: '25:25:50' },
      { layout: '1fr 2fr 1fr', icon: '25:50:25' },
      { layout: '2fr 1fr 1fr', icon: '50:25:25' },
    ],
  },
};

const getColumns = (type, layoutIdx = 0) => {
  const newChildren = Array(COLUMNS_LAYOUT[type].repeat)
    .fill(null)
    .map(() => ({
      type: 'column',
      children: [{ type: paragraphElement.type, children: [{ text: '' }] }],
    }));

  return {
    type: `columns`,
    colType: type,
    layout: COLUMNS_LAYOUT[type]['view'][layoutIdx]['layout'],
    children: newChildren,
  };
};

// UI Components
const ColumnContainer = ({ attributes, children, element }) => {
  const focused = useFocused();
  const selected = useSelected();
  const editor = useSlate();

  const remove = useCallback(
    event => {
      event.preventDefault();
      const path = ReactEditor.findPath(editor, element);
      // TODO: Fix this
      Transforms.removeNodes(editor, { at: path });
      Transforms.insertNodes(editor, paragraphElement, { at: path, select: true });
    },
    [editor, element]
  );
  return (
    <div
      css={{
        display: 'grid',
        margin: '8px 0',
        gridTemplateColumns: element.layout,
        position: 'relative',
        columnGap: 4,
      }}
      {...attributes}
    >
      {children}
      {focused && selected ? (
        <ColumnsTypeSelect
          value={element.layout}
          colType={element.colType}
          onChange={value => {
            const path = ReactEditor.findPath(editor, element);

            const cols = { type: 'columns', layout: value };
            Transforms.setNodes(editor, cols, { at: path });
          }}
        />
      ) : null}
    </div>
  );
};

// Single Columns
const Column = ({ attributes, children }) => (
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

// Column layout options toolbar
const ColumnsTypeSelect = ({ colType, value, onChange }) => {
  const { view } = COLUMNS_LAYOUT[colType];
  return (
    <div
      contentEditable={false}
      css={{
        userSelect: 'none',
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: `translateX(-50%)`,
        zIndex: 1,
      }}
    >
      <div
        css={{
          display: 'flex',
          marginTop: 8,
          padding: 6,
          background: 'white',
          borderRadius: 6,
          paddingLeft: 10,
          border: '1px solid rgba(0, 0, 0, 0.3)',
          boxShadow: `
  0 2.4px 10px rgba(0, 0, 0, 0.09),
  0 19px 80px rgba(0, 0, 0, 0.18)`,
          top: 0,
        }}
      >
        {view.map(v => (
          <Button
            isPressed={v.layout === value}
            key={v.layout}
            onMouseDown={event => {
              event.preventDefault();
              onChange(v.layout);
            }}
          >
            {v.icon}
          </Button>
        ))}
      </div>
    </div>
  );
};

export const isInsideColumn = editor => {
  return isBlockActive(editor, 'columns');
};

// Helper function
export const insertColumns = (editor, type) => {
  if (isInsideColumn(editor)) return;

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const [block, path] = getBlockAboveSelection(editor);

  // We insert a paragraph after the `columns` node, so that user can make a selection after it.
  const nodes = [getColumns(type), paragraphElement];

  if (block && isCollapsed && block.type === paragraphElement.type && isBlockTextEmpty(block)) {
    Transforms.removeNodes(editor, path);
    Transforms.insertNodes(editor, nodes, { at: path, select: true });
  } else {
    Transforms.insertNodes(editor, nodes, { select: true });
  }
  // Move the selection back to first column
  Transforms.move(editor, {
    distance: COLUMNS_LAYOUT[type].repeat - 1,
    reverse: true,
    unit: 'line',
  });
};

export const renderColumnsElement = props => {
  switch (props.element.type) {
    case 'columns':
      return <ColumnContainer {...props} />;
    case 'column':
      return <Column {...props} />;
  }
};

// Plugin
export const withColumns = editor => {
  const { deleteBackward, deleteForward } = editor;

  editor.deleteBackward = unit => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [col] = Editor.nodes(editor, {
        match: n => n.type === 'column',
      });

      if (col) {
        const [, colPath] = col;
        const start = Editor.start(editor, colPath);

        if (Point.equals(selection.anchor, start)) {
          return;
        }
      }
    }

    deleteBackward(unit);
  };

  editor.deleteForward = unit => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [col] = Editor.nodes(editor, {
        match: n => n.type === 'column',
      });

      if (col) {
        const [, colPath] = col;
        const end = Editor.end(editor, colPath);

        if (Point.equals(selection.anchor, end)) {
          return;
        }
      }
    }

    deleteForward(unit);
  };

  return editor;
};
