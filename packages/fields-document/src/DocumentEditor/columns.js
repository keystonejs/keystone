/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Editor, Path, Range, Transforms } from 'slate';
import { ReactEditor, useFocused, useSelected, useSlate } from 'slate-react';

import { Button } from './components';
import { isBlockTextEmpty, getBlockAboveSelection, isBlockActive } from './utils';

const COLUMNS_LAYOUT = {
  two: {
    icon: '⬆',
    repeat: 2,
  },
  three: {
    icon: '↓',
    repeat: 3,
  },
};

const COLUMNS_LAYOUT_KEYS = Object.keys(COLUMNS_LAYOUT);
const DEFAULT_COLUMNS_LAYOUT = COLUMNS_LAYOUT_KEYS[0];

const columnsElement = { type: 'columns', columnsLayout: DEFAULT_COLUMNS_LAYOUT, children: [] };

export const isInsideColumn = editor => {
  return isBlockActive(editor, 'columns');
};

// Helper function
export const insertColumns = editor => {
  // TODO: should we allow inserting nested columns?
  if (isInsideColumn(editor)) return;
  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const [block] = getBlockAboveSelection(editor);
  if (!!block && isCollapsed && isBlockTextEmpty(block)) {
    Transforms.wrapNodes(
      editor,
      { type: 'columns', columnsLayout: DEFAULT_COLUMNS_LAYOUT, children: [] },
      { match: n => Editor.isBlock(editor, n) }
    );
  } else {
    Transforms.insertNodes(editor, columnsElement, { select: true });
  }
};

// Plugin
export const withColumns = editor => {
  const { insertBreak } = editor;
  editor.insertBreak = () => {
    console.log('inserting break');
    const [block] = getBlockAboveSelection(editor);

    console.log({ block, isEmpty: isBlockTextEmpty(block) });
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

export const ColumnsElement = ({ attributes, children, element }) => {
  const columnsLayoutKey = COLUMNS_LAYOUT[element.columnsLayout]
    ? element.columnsLayout
    : DEFAULT_COLUMNS_LAYOUT;

  console.log({ columnsLayoutKey });
  const columnsLayout = COLUMNS_LAYOUT[columnsLayoutKey];
  const focused = useFocused();
  const selected = useSelected();
  const editor = useSlate();
  return (
    <div
      css={{
        display: 'grid',
        margin: '8px 0',
        gridTemplateColumns: `repeat(${columnsLayout.repeat}, 1fr)`,
        columnGap: 4,
      }}
      {...attributes}
    >
      {Array.from({ length: columnsLayout.repeat }).map((col, idx) => (
        <div
          key={`col-${idx}`}
          css={{
            backgroundColor: '#EBF8FF',
            border: 'solid 2px #90CDF4',
            borderRadius: 4,
            padding: 4,
          }}
        >
          {children}
        </div>
      ))}
      {focused && selected ? (
        <ColumnsTypeSelect
          value={columnsLayoutKey}
          onChange={value => {
            const path = ReactEditor.findPath(editor, element);
            console.log({ path });
            Transforms.setNodes(editor, { columnsLayout: value }, { at: path });
          }}
        />
      ) : null}
    </div>
  );
};
