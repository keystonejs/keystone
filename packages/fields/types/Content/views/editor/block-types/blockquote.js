/** @jsx jsx */
import { jsx } from '@emotion/core';
import { hasAncestorBlock } from '../utils';
import { QuoteIcon } from '@voussoir/icons';
import { ToolbarCheckbox } from '../toolbar-components';

export let type = 'blockquote';

export function ToolbarElement({ editor, editorState }) {
  let hasBlockquote = hasAncestorBlock(editorState, type);

  return (
    <ToolbarCheckbox
      isActive={hasBlockquote}
      onChange={() => {
        if (hasBlockquote) {
          editor.unwrapBlock(type);
        } else {
          editor.wrapBlock(type);
        }
      }}
    >
      <QuoteIcon title="Blockquote" />
    </ToolbarCheckbox>
  );
}

export function Node({ attributes, children }) {
  return (
    <blockquote
      {...attributes}
      css={{
        borderLeft: '4px solid #eee',
        color: '#666',
        fontStyle: 'italic',
        margin: 0,
        marginBottom: '1em',
        paddingLeft: '1em',
      }}
    >
      {children}
    </blockquote>
  );
}
