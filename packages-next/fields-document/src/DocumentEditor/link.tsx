/** @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import { LinkIcon } from '@keystone-ui/icons/icons/LinkIcon';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';
import { ExternalLinkIcon } from '@keystone-ui/icons/icons/ExternalLinkIcon';
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlate } from 'slate-react';
import { Editor, Node, Range, Transforms } from 'slate';
// @ts-ignore
import isUrl from 'is-url';

import { useState } from 'react';

import { Button } from './components';
import { HoverableElement } from './components/hoverable';
import { useControlledPopover } from '@keystone-ui/popover';

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
  const { typography } = useTheme();
  const url = element.url as string;
  const editor = useSlate();
  const selected = useSelected();
  const focused = useFocused();
  const [focusedInHoverable, setFocusedInHoverable] = useState(false);
  const { dialog, trigger } = useControlledPopover({
    isOpen: (selected && focused) || focusedInHoverable,
    onClose: () => {},
  });

  return (
    <span {...attributes} css={{ position: 'relative', display: 'inline-block' }}>
      <a {...trigger.props} ref={trigger.ref} href={url}>
        {children}
      </a>
      {((selected && focused) || focusedInHoverable) && (
        <HoverableElement
          {...dialog.props}
          ref={dialog.ref}
          onFocus={() => {
            setFocusedInHoverable(true);
          }}
          onBlur={() => {
            setFocusedInHoverable(false);
          }}
        >
          <input
            css={{ fontSize: typography.fontSize.small }}
            value={url}
            onChange={event => {
              Transforms.setNodes(
                editor,
                { url: event.target.value },
                { at: ReactEditor.findPath(editor, element) }
              );
            }}
          />
          <Button
            as="a"
            onMouseDown={event => {
              event.preventDefault();
            }}
            href={url}
            target="_blank"
            rel="noreferrer"
            variant="action"
          >
            <ExternalLinkIcon size="small" />
          </Button>
          <Button
            variant="destructive"
            onMouseDown={event => {
              event.preventDefault();
              Transforms.unwrapNodes(editor, {
                at: ReactEditor.findPath(editor, element),
              });
            }}
          >
            <Trash2Icon size="small" />
          </Button>
        </HoverableElement>
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
      <LinkIcon size="small" />
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
