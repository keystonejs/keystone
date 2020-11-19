/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlate } from 'slate-react';
import { Editor, Node, Range, Transforms } from 'slate';
// @ts-ignore
import isUrl from 'is-url';

import { useState } from 'react';

import { Button } from './components';
import { Hoverable } from './components/hoverable';

const isLinkActive = (editor: ReactEditor) => {
  const [link] = Editor.nodes(editor, { match: n => n.type === 'link' });
  return !!link;
};

const unwrapLink = (editor: ReactEditor) => {
  Transforms.unwrapNodes(editor, { match: n => n.type === 'link' });
};

const wrapLink = (editor: ReactEditor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
    return;
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [{ text: '' }],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
  }
};

export const LinkElement = ({ attributes, children, element }: RenderElementProps) => {
  const url = element.url as string;
  const editor = useSlate();
  const selected = useSelected();
  const focused = useFocused();
  const [focusedInHoverable, setFocusedInHoverable] = useState(false);

  return (
    <span {...attributes} css={{ position: 'relative', display: 'inline-block' }}>
      <a href={url}>{children}</a>
      {((selected && focused) || focusedInHoverable) && (
        <Hoverable
          onFocus={() => {
            setFocusedInHoverable(true);
          }}
          onBlur={() => {
            setFocusedInHoverable(false);
          }}
        >
          <input
            value={url}
            onChange={event => {
              Transforms.setNodes(
                editor,
                { url: event.target.value },
                { at: ReactEditor.findPath(editor, element) }
              );
            }}
          />
          <a
            onMouseDown={event => {
              event.preventDefault();
            }}
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            Go
          </a>
          <Button
            onMouseDown={event => {
              event.preventDefault();
            }}
            onClick={() => {
              Transforms.unwrapNodes(editor, {
                at: ReactEditor.findPath(editor, element),
              });
            }}
          >
            Unlink
          </Button>
        </Hoverable>
      )}
    </span>
  );
};

export const LinkButton = () => {
  const editor = useSlate();
  const isActive = isLinkActive(editor);
  return (
    <Button
      isDisabled={!isActive && (!editor.selection || Range.isCollapsed(editor.selection))}
      isSelected={isActive}
      onMouseDown={event => {
        event.preventDefault();
        wrapLink(editor, '');
      }}
    >
      link
    </Button>
  );
};

export const withLink = (editor: ReactEditor) => {
  const { insertData, insertText, isInline, normalizeNode } = editor;

  editor.isInline = element => {
    return element.type === 'link' ? true : isInline(element);
  };

  editor.insertText = text => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.normalizeNode = ([node, path]) => {
    if (node.type === 'link' && Node.string(node) === '') {
      Transforms.unwrapNodes(editor, { at: path });
      return;
    }
    normalizeNode([node, path]);
  };

  editor.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain');

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      (insertData as any)(data);
    }
  };

  return editor;
};
