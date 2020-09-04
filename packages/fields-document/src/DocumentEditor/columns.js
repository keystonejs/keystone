/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Editor, Path, Point, Range, Transforms } from 'slate';
import { ReactEditor, useFocused, useSelected, useSlate } from 'slate-react';

import { Button } from './components';
import { paragraphElement } from './paragraphs';
import { debugLog, isBlockTextEmpty, getBlockAboveSelection, isBlockActive } from './utils';

const COLUMNS_LAYOUT = {
  two: {
    icon: 'Two',
    repeat: 2,
    layout: ['1fr 1fr', '2fr 1fr', '1fr 2fr'],
  },
  three: {
    icon: 'Three',
    repeat: 3,
    layout: ['1fr 1fr 1fr', '1fr 1fr 2fr', '1fr 2fr 1fr'],
  },
};

const COLUMNS_LAYOUT_KEYS = Object.keys(COLUMNS_LAYOUT);
const DEFAULT_COLUMNS_LAYOUT = COLUMNS_LAYOUT_KEYS[0];

const getColumns = (type, layoutIdx = 0) => {
  const newChildren = Array(COLUMNS_LAYOUT[type].repeat)
    .fill(null)
    .map(() => ({
      type: 'column',
      children: [{ type: paragraphElement.type, children: [{ text: '' }] }],
    }));

  return {
    type: `columns`,
    cols: COLUMNS_LAYOUT[type]['repeat'],
    layout: COLUMNS_LAYOUT[type]['layout'][layoutIdx],
    children: newChildren,
  };
};

// UI Components
const ColumnContainer = ({ attributes, children, element }) => {
  const focused = useFocused();
  const selected = useSelected();
  const editor = useSlate();

  return (
    <div
      css={{
        display: 'grid',
        margin: '8px 0',
        gridTemplateColumns: element.layout,
        columnGap: 4,
      }}
      {...attributes}
    >
      {children}
      {/**
       {focused && selected ? (
           <ColumnsTypeSelect
         value={columnsLayoutKey}
         onChange={value => {
           console.log({ editor, element, value });
           const path = ReactEditor.findPath(editor, element);
           const layout = COLUMNS_LAYOUT[value].repeat;
           const newChildren = Array(layout).fill({
             type: 'column',
             children: [{ type: paragraphElement.type, children: [{ text: '' }] }],
           });
           const cols = { type: 'columns', layout: value, children: newChildren };

           if (layout > 2) {
    // TODO: append the 3rd col element
           } else {
             // remove the last child
           }
           Transforms.removeNodes(editor, { at: path });
           Transforms.insertNodes(editor, cols, { at: path });
         }}
         />
       ) : null}
      */}
    </div>
  );
};

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

export const isInsideColumn = editor => {
  return isBlockActive(editor, 'columns');
};

// Helper function
export const insertColumns = (editor, type) => {
  if (isInsideColumn(editor)) return;

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const [block, path] = getBlockAboveSelection(editor);

  const columns = getColumns(type);
  if (block && isCollapsed && block.type === paragraphElement.type && isBlockTextEmpty(block)) {
    Transforms.removeNodes(editor, path);
    Transforms.insertNodes(editor, columns, { at: path, select: true });
  } else {
    Transforms.insertNodes(editor, columns, { select: true });
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
  const { insertBreak, deleteBackward } = editor;

  // Insert Break
  editor.insertBreak = () => {
    const [block] = getBlockAboveSelection(editor);

    if (block && isBlockTextEmpty(block)) {
      const columns = Editor.above(editor, {
        match: n => n.type === 'columns',
      });

      if (columns) {
        const [, path] = columns;
        Transforms.insertNodes(
          editor,
          { type: 'paragraph', children: [{ text: '' }] },
          {
            at: Path.next(path),
            select: true,
          }
        );
        return;
      }
    }

    insertBreak();
  };

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

  //// Normalizing
  //editor.normalizeNode = ([node, path]) => {
  //console.log('normalizeNode...');
  //if (node.type === columns.type) {
  //debugLog('normalizeNode: columns: we are inside the columns node alreay');
  //}
  //};
  return editor;
};

// Column layout options toolbar
const ColumnsTypeSelect = ({ value, onChange }) => {
  return (
    <div
      contentEditable={false}
      css={{
        userSelect: 'none',
        position: 'relative',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        css={{
          position: 'absolute',
          marginTop: 8,
          padding: 6,
          background: 'white',
          borderRadius: 6,
          paddingLeft: 10,
          border: '1px solid rgba(0, 0, 0, 0.3)',
          boxShadow: `
  0 2.4px 10px rgba(0, 0, 0, 0.09),
  0 19px 80px rgba(0, 0, 0, 0.18)`,
        }}
      >
        {Object.keys(COLUMNS_LAYOUT).map(type => (
          <Button
            isPressed={type === value}
            key={type}
            onMouseDown={event => {
              event.preventDefault();
              onChange(type);
            }}
          >
            {COLUMNS_LAYOUT[type].icon}
          </Button>
        ))}
      </div>
    </div>
  );
};

export const ColumnsElement = props => {
  const { element, children } = props;
  const columnsLayoutKey = COLUMNS_LAYOUT[element.columnsLayout]
    ? element.columnsLayout
    : DEFAULT_COLUMNS_LAYOUT;

  const columnsLayout = COLUMNS_LAYOUT[columnsLayoutKey];
  const focused = useFocused();
  const selected = useSelected();
  const editor = useSlate();
  return (
    <div>
      <RenderColumnsElement {...props} col={columnsLayout.repeat} />
      {focused && selected ? (
        <ColumnsTypeSelect
          value={columnsLayoutKey}
          onChange={value => {
            const path = ReactEditor.findPath(editor, element);
            Transforms.setNodes(editor, { layout: value, type: 'columns' }, { at: path });
          }}
        />
      ) : null}
    </div>
  );
};
