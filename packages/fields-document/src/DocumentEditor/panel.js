/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Editor, Path, Point, Range, Node, Transforms } from 'slate';
import { ReactEditor, useFocused, useSelected, useSlate } from 'slate-react';

import { Button } from './components';
import { isBlockTextEmpty, getBlockAboveSelection, isBlockActive } from './utils';

const PANEL_TYPES = {
  note: {
    background: '#EBF8FF',
    border: '#90CDF4',
    foreground: '#2C5282',
    icon: '👋',
  },
  alert: {
    background: '#FFF5F5',
    border: '#FEB2B2',
    foreground: '#9B2C2C',
    icon: '🚨',
  },
  tip: {
    background: '#EBF4FF',
    border: '#C3DAFE',
    foreground: '#4C51BF',
    icon: '💎',
  },
  success: {
    background: '#F0FFF4',
    border: '#9AE6B4',
    foreground: '#276749',
    icon: '✅',
  },
};
const PANEL_TYPE_KEYS = Object.keys(PANEL_TYPES);
const DEFAULT_PANEL_TYPE = PANEL_TYPE_KEYS[0];

const panelElement = {
  type: 'panel',
  panelType: DEFAULT_PANEL_TYPE,
  children: [{ text: '' }],
};

const getPanelAbove = editor => Editor.above(editor, { match: n => n.type === panelElement.type });

export const isInsidePanel = editor => {
  return isBlockActive(editor, 'panel');
};

export const insertPanel = editor => {
  if (isInsidePanel(editor)) return;
  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const [block] = getBlockAboveSelection(editor);

  if (!!block && isCollapsed && isBlockTextEmpty(block)) {
    Transforms.setNodes(
      editor,
      { type: 'panel', panelType: DEFAULT_PANEL_TYPE },
      { match: n => Editor.isBlock(editor, n) }
    );
  } else {
    Transforms.insertNodes(editor, panelElement, { select: true });
  }
};

export const withPanel = editor => {
  const { insertBreak, deleteBackward, deleteForward } = editor;
  editor.insertBreak = () => {
    const panel = getPanelAbove(editor);

    //NOTE: Panel can have only one block element; upon break insert, we add paragraph beneath it.
    if (panel) {
      const [, path] = panel;
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

    insertBreak();
  };

  editor.deleteBackward = unit => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const panel = getPanelAbove(editor);
      if (panel) {
        const [node, path] = panel;
        const panelContent = Node.string(node);

        // Remove the `panel` element if there's no content
        if (!panelContent) {
          // NOTE: If the node is the last Panel node, removing it throws an exception.
          // Ref: https://github.com/ianstormtaylor/slate/issues/3834).
          // To mitigate this problem, we are inserting an empty paragraph element.
          Transforms.removeNodes(editor, { at: path });
          Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] });
          return;
        }
      }
    }
    deleteBackward(unit);
  };

  editor.deleteForward = unit => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [panel] = Editor.nodes(editor, {
        match: n => n.type === 'panel',
      });

      if (panel) {
        const [, panelPath] = panel;
        const end = Editor.end(editor, panelPath);

        if (Point.equals(selection.anchor, end)) {
          return;
        }
      }
    }

    deleteForward(unit);
  };
  return editor;
};

const PanelTypeSelect = ({ value, onChange }) => {
  return (
    <div
      contentEditable={false}
      css={{
        userSelect: 'none',
        position: 'absolute',
        top: '100%',
        left: '50%',
        justifyContent: 'center',
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
        }}
      >
        {PANEL_TYPE_KEYS.map(type => (
          <Button
            isPressed={type === value}
            key={type}
            onMouseDown={event => {
              event.preventDefault();
              onChange(type);
            }}
          >
            {type}
          </Button>
        ))}
      </div>
    </div>
  );
};

export const PanelElement = ({ attributes, children, element }) => {
  const panelTypeKey = PANEL_TYPES[element.panelType] ? element.panelType : DEFAULT_PANEL_TYPE;
  const panelType = PANEL_TYPES[panelTypeKey];
  const focused = useFocused();
  const selected = useSelected();
  const editor = useSlate();
  return (
    <div
      css={{
        margin: '8px 0',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        borderColor: panelType.border,
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: panelType.background,
        color: panelType.foreground,
      }}
      {...attributes}
    >
      <div
        contentEditable={false}
        style={{
          userSelect: 'none',
          margin: 12,
          fontSize: 16,
          float: 'left',
        }}
      >
        {panelType.icon}
      </div>
      {children}
      {focused && selected ? (
        <PanelTypeSelect
          value={panelTypeKey}
          onChange={value => {
            const path = ReactEditor.findPath(editor, element);
            Transforms.setNodes(editor, { panelType: value }, { at: path });
          }}
        />
      ) : null}
    </div>
  );
};
