/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Editor, Node, Path, Range, Transforms } from 'slate';

import { getBlockAboveSelection, isBlockActive, isBlockTextEmpty } from './utils';

export const isInsideQuote = editor => {
  return isBlockActive(editor, 'quote');
};

const quoteElement = {
  type: 'quote',
  children: [
    { type: 'quote-content', children: [{ text: '' }] },
    { type: 'quote-attribution', children: [{ text: '' }] },
  ],
};

export const insertQuote = editor => {
  if (isInsideQuote(editor)) return;

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const [block, path] = getBlockAboveSelection(editor);
  if (block && isCollapsed && isBlockTextEmpty(block)) {
    Transforms.removeNodes(editor, { at: path });
  }

  Transforms.insertNodes(editor, quoteElement, { select: true });
  // move the selection back by one line so the cursor starts in the content
  Transforms.move(editor, { distance: 1, reverse: true, unit: 'line' });
};

export const withQuote = editor => {
  const { deleteBackward, insertBreak, normalizeNode } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const quote = Editor.above(editor, {
        match: n => n.type === 'quote',
      });

      if (quote) {
        const [node, path] = quote;
        const content = Node.string(node);
        if (!content && node.children.length === 2) {
          Transforms.removeNodes(editor, { at: path });
          return;
        }
      }

      deleteBackward(...args);
    }
  };

  editor.insertBreak = () => {
    const quote = Editor.above(editor, {
      match: n => n.type === 'quote-attribution',
    });
    if (quote) {
      const [, path] = quote;
      Transforms.insertNodes(
        editor,
        { type: 'paragraph', children: [{ text: '' }] },
        {
          at: Path.next(path.slice(0, -1)),
          select: true,
        }
      );
      return;
    }

    insertBreak();
  };

  editor.normalizeNode = ([node, path]) => {
    if (node.type === quoteElement.type) {
      const children = Array.from(Node.children(editor, path));

      if (!children.length) {
        Transforms.removeNodes(editor, path);
        return;
      }

      const contentElement = quoteElement.children[0];
      if (children[0][0].type !== contentElement.type) {
        Transforms.insertNodes(editor, contentElement, { at: [...path, 0] });
        return;
      }

      const attributionElement = quoteElement.children[1];
      if (children[children.length - 1][0].type !== attributionElement.type) {
        Transforms.insertNodes(editor, attributionElement, { at: [...path, children.length] });
        return;
      }

      for (var i = 1; i < children.length - 1; i++) {
        if (children[i].type !== contentElement.type) {
          Transforms.setNodes(editor, { type: contentElement.type }, { at: [...path, i] });
        }
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
};

export const renderQuoteElement = props => {
  switch (props.element.type) {
    case 'quote':
      return <QuoteElement {...props} />;
    case 'quote-content':
      return <QuoteContentElement {...props} />;
    case 'quote-attribution':
      return <QuoteAttributionElement {...props} />;
  }
};

const QuoteElement = ({ attributes, children }) => {
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

const QuoteContentElement = ({ attributes, children }) => {
  return (
    <p css={{ fontStyle: 'italic', color: '#4A5568' }} {...attributes}>
      {children}
    </p>
  );
};

const QuoteAttributionElement = ({ attributes, children }) => {
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
