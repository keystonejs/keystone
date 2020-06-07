/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Editor, Transforms, Range } from 'slate';

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

export const PanelElement = ({ attributes, children, element }) => {
  return (
    <div
      css={{
        margin: '8px 0',
        border: '1px solid rgb(212,230,255)',
        borderRadius: 8,
        backgroundColor: 'rgb(233,243,255)',
        color: 'rgb(30, 106, 204)',
        overflow: 'hidden',
      }}
      {...attributes}
    >
      <div
        contentEditable={false}
        style={{
          margin: '12px 16px 12px 12px',
          fontSize: 14,
          float: 'left',
          userSelect: 'none',
        }}
      >
        👋🏻
      </div>
      <p>{children}</p>
    </div>
  );
};
