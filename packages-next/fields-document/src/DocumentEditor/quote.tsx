/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { Editor, Node, Path, Range, Transforms } from 'slate';
import { ReactEditor, RenderElementProps } from 'slate-react';

import { paragraphElement } from './paragraphs';
import {
  debugLog,
  getBlockAboveSelection,
  isBlockActive,
  isFirstChild,
  isLastBlockTextEmpty,
} from './utils';

export const isInsideQuote = (editor: ReactEditor) => {
  return isBlockActive(editor, types.root);
};

const types = {
  root: 'quote',
  content: 'quote-content',
  attribution: 'quote-attribution',
};

const quoteElement = () => ({
  type: types.root,
  children: [
    {
      type: types.content,
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    },
    { type: types.attribution, children: [{ text: '' }] },
  ],
});

export const insertQuote = (editor: ReactEditor) => {
  if (isInsideQuote(editor)) return;

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const [block, path] = getBlockAboveSelection(editor);
  if (block && isCollapsed && block.type === 'paragraph' && Node.string(block) === '') {
    Transforms.removeNodes(editor, { at: path });
    Transforms.insertNodes(editor, quoteElement(), { at: path, select: true });
  } else {
    Transforms.insertNodes(editor, quoteElement(), { select: true });
  }
  // move the selection back by one line so the cursor starts in the content
  Transforms.move(editor, { distance: 1, reverse: true, unit: 'line' });
};

export const withQuote = (editor: ReactEditor) => {
  const { deleteBackward, insertBreak, normalizeNode } = editor;

  editor.deleteBackward = unit => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const quote = Editor.above(editor, {
        match: n => n.type === 'quote',
      });

      if (quote) {
        // delete an empty quote if there is no content
        const [quoteNode, quotePath] = quote;
        const quoteContent = Node.string(quoteNode);
        if (!quoteContent && quoteNode.children.length === 2) {
          Transforms.removeNodes(editor, { at: quotePath });
          return;
        }

        const content = Editor.above(editor, {
          match: n => n.type === 'quote-content',
        });

        if (content) {
          const [contentBlock, contentPath] = content;
          if (
            isFirstChild(contentPath) &&
            isLastBlockTextEmpty(contentBlock) &&
            quoteNode.children.length > 2
          ) {
            Transforms.removeNodes(editor, { at: contentPath });
            debugLog(quotePath);
            Transforms.insertNodes(editor, paragraphElement(), {
              at: quotePath,
              select: true,
            });
            return;
          }
        }
      }
    }

    deleteBackward(unit);
  };

  editor.insertBreak = () => {
    const quote = Editor.above(editor, {
      match: n => n.type === 'quote',
    });

    if (quote) {
      const [, path] = quote;

      // insert a new paragraph after the quote if the cursor is in the attribution
      const attribution = Editor.above(editor, {
        match: n => n.type === 'quote-attribution',
      });
      if (attribution) {
        Transforms.insertNodes(editor, paragraphElement(), {
          at: Path.next(path),
          select: true,
        });
        return;
      }
    }

    insertBreak();
  };

  editor.normalizeNode = ([node, path]) => {
    const contentElement = quoteElement().children[0];
    const attributionElement = quoteElement().children[1];

    if (node.type === types.root) {
      const children = [...Node.children(editor, path)];

      if (!children.length) {
        debugLog('normalizeNode: quotes: removing empty quote node');
        Transforms.removeNodes(editor, { at: path });
        return;
      }

      if (children[0][0].type !== types.content) {
        debugLog('normalizeNode: quotes: inserting initial content node');
        Transforms.insertNodes(editor, contentElement, { at: [...path, 0] });
        return;
      }

      if (children[children.length - 1][0].type !== types.attribution) {
        Transforms.insertNodes(editor, attributionElement, {
          at: [...path, children.length],
        });
        return;
      }

      for (var i = 1; i < children.length - 1; i++) {
        if (children[i][0].type !== types.content) {
          Transforms.setNodes(editor, { type: types.content }, { at: [...path, i] });
          return;
        }
      }
    }

    // ensure quote content and attribution nodes are within a quote, otherwise turn them into paragraphs
    if (node.type === contentElement.type || node.type === attributionElement.type) {
      const parent = Node.parent(editor, path);
      if (parent.type !== types.root) {
        Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
        return;
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
};

export const renderQuoteElement = (props: RenderElementProps) => {
  // eslint-disable-next-line default-case
  switch (props.element.type) {
    case 'quote':
      return <QuoteElement {...props} />;
    case 'quote-content':
      return <QuoteContentElement {...props} />;
    case 'quote-attribution':
      return <QuoteAttributionElement {...props} />;
  }
};

const QuoteElement = ({ attributes, children }: RenderElementProps) => {
  return (
    <div
      css={{
        borderLeft: '3px solid #CBD5E0',
        paddingLeft: 16,
      }}
      {...attributes}
    >
      {children}
    </div>
  );
};

const QuoteContentElement = ({ attributes, children }: RenderElementProps) => {
  return (
    <p css={{ fontStyle: 'italic', color: '#4A5568' }} {...attributes}>
      {children}
    </p>
  );
};

const QuoteAttributionElement = ({ attributes, children }: RenderElementProps) => {
  return (
    <div css={{ fontWeight: 'bold', color: '#718096' }} {...attributes}>
      <span
        contentEditable={false}
        style={{
          userSelect: 'none',
        }}
      >
        —{' '}
      </span>
      {children}
    </div>
  );
};
