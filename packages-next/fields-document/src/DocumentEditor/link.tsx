/** @jsx jsx */

import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlate } from 'slate-react';
import { Editor, Node, Range, Transforms } from 'slate';

import { jsx, useTheme } from '@keystone-ui/core';
import { useControlledPopover } from '@keystone-ui/popover';
import { Tooltip } from '@keystone-ui/tooltip';
import { LinkIcon } from '@keystone-ui/icons/icons/LinkIcon';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';
import { ExternalLinkIcon } from '@keystone-ui/icons/icons/ExternalLinkIcon';
// @ts-ignore
import isUrl from 'is-url';

import { useState } from 'react';

import { Button, ButtonGroup, Separator } from './components';
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
        <Hoverable
          {...dialog.props}
          ref={dialog.ref}
          onFocus={() => {
            setFocusedInHoverable(true);
          }}
          onBlur={() => {
            setFocusedInHoverable(false);
          }}
        >
          <ButtonGroup>
            <input
              css={{ fontSize: typography.fontSize.small, width: 240 }}
              value={url}
              onChange={event => {
                Transforms.setNodes(
                  editor,
                  { url: event.target.value },
                  { at: ReactEditor.findPath(editor, element) }
                );
              }}
            />
            <Tooltip content="Open link in new tab" weight="subtle">
              {attrs => (
                <Button
                  as="a"
                  onMouseDown={event => {
                    event.preventDefault();
                  }}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  variant="action"
                  {...attrs}
                >
                  <ExternalLinkIcon size="small" />
                </Button>
              )}
            </Tooltip>
            <Separator />
            <Tooltip content="Unlink" weight="subtle">
              {attrs => (
                <Button
                  variant="destructive"
                  onMouseDown={event => {
                    event.preventDefault();
                    Transforms.unwrapNodes(editor, {
                      at: ReactEditor.findPath(editor, element),
                    });
                  }}
                  {...attrs}
                >
                  <Trash2Icon size="small" />
                </Button>
              )}
            </Tooltip>
          </ButtonGroup>
        </Hoverable>
      )}
    </span>
  );
};

export const LinkButton = () => {
  const editor = useSlate();
  const isActive = isLinkActive(editor);
  return (
    <Tooltip content="Link" placement="bottom" weight="subtle" hideOnClick>
      {attrs => (
        <Button
          isDisabled={!isActive && (!editor.selection || Range.isCollapsed(editor.selection))}
          isSelected={isActive}
          onMouseDown={event => {
            event.preventDefault();
            wrapLink(editor, '');
          }}
          {...attrs}
        >
          <LinkIcon size="small" />
        </Button>
      )}
    </Tooltip>
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
