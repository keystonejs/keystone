/** @jsx jsx */
import { jsx } from '@emotion/core';
import { isBlockActive } from '../utils';
import { QuoteIcon } from '@arch-ui/icons';
import { ToolbarButton } from '../toolbar-components';
import { useSlate, ReactEditor } from 'slate-react';
import { Transforms } from 'slate';

export const type = 'blockquote';

export const ToolbarElement = () => {
  const editor = useSlate();
  const hasBlockquote = isBlockActive(editor, type);

  return (
    <ToolbarButton
      isActive={hasBlockquote}
      icon={<QuoteIcon />}
      label="Blockquote"
      onClick={() => {
        if (hasBlockquote) {
          Transforms.unwrapNodes(editor, { match: n => n.type === type, split: true });
        } else {
          Transforms.wrapNodes(editor, { type, children: [] }, { split: true });
        }

        ReactEditor.focus(editor);
      }}
    />
  );
};

export const Node = ({ attributes, children }) => {
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
};
