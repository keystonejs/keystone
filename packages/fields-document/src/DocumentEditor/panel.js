/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Editor, Path, Range, Transforms } from 'slate';
import { ReactEditor, useFocused, useSelected, useSlate } from 'slate-react';

import { Button } from './components';

const PANEL_TYPES = {
  note: {
    background: '#DEEBFF',
    border: '#2684FF',
    foreground: '#0747A6',
    icon: '👋',
  },
  alert: {
    background: '#FFEBE6',
    border: '#FF5630',
    foreground: '#BF2600',
    icon: '🚨',
  },
  tip: {
    background: '#EAE6FF',
    border: '#6554C0',
    foreground: '#403294',
    icon: '💎',
  },
  success: {
    background: '#E3FCEF',
    border: '#36B37E',
    foreground: '#006644',
    icon: '✅',
  },
};
const PANEL_TYPE_KEYS = Object.keys(PANEL_TYPES);
const DEFAULT_PANEL_TYPE = PANEL_TYPE_KEYS[0];

// import { Button } from './components';
import { isBlockTextEmpty, getBlockAboveSelection, isBlockActive } from './utils';

export const isInsidePanel = editor => {
  return isBlockActive(editor, 'panel');
};

export const insertPanel = editor => {
  if (isInsidePanel(editor)) return;
  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const [block] = getBlockAboveSelection(editor);
  if (!!block && isCollapsed && isBlockTextEmpty(block)) {
    Transforms.setNodes(editor, { type: 'panel' }, { match: n => Editor.isBlock(editor, n) });
  } else {
    const element = { type: 'panel', children: [{ text: '' }] };
    Transforms.insertNodes(editor, element, { select: true });
  }
};

export const withPanel = editor => {
  const { insertBreak } = editor;
  editor.insertBreak = () => {
    const panel = Editor.above(editor, {
      match: n => n.type === 'panel',
    });
    console.log(panel);
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
  return editor;
};

const PanelTypeSelect = ({ value, onChange }) => {
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
          borderRadius: 8,
          paddingLeft: 10,
          border: '1px solid rgba(0,0,0,0.3)',
          boxShadow: `
  0 2.4px 10px rgba(0, 0, 0, 0.08),
  0 19px 80px rgba(0, 0, 0, 0.16)`,
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
      <p>{children}</p>
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
