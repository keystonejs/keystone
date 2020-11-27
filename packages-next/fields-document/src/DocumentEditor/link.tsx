/** @jsx jsx */

import {
  ReactEditor,
  RenderElementProps,
  useEditor,
  useFocused,
  useSelected,
  useSlate,
} from 'slate-react';
import { Editor, Node, Range, Transforms } from 'slate';
import { ButtonHTMLAttributes, useState } from 'react';
// @ts-ignore
import isUrl from 'is-url';

import { jsx, useTheme } from '@keystone-ui/core';
import { useControlledPopover } from '@keystone-ui/popover';
import { Tooltip } from '@keystone-ui/tooltip';
import { LinkIcon } from '@keystone-ui/icons/icons/LinkIcon';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';
import { ExternalLinkIcon } from '@keystone-ui/icons/icons/ExternalLinkIcon';

import { InlineDialog, ToolbarButton, ToolbarGroup, ToolbarSeparator } from './primitives';

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
  // useEditor does not update when the value/selection changes.
  // that's fine for what it's being used for here
  // because we're just inserting things on events, not reading things in render
  const editor = useEditor();
  const selected = useSelected();
  const focused = useFocused();
  const [focusedInInlineDialog, setFocusedInInlineDialog] = useState(false);
  const { dialog, trigger } = useControlledPopover(
    {
      isOpen: (selected && focused) || focusedInInlineDialog,
      onClose: () => {},
    },
    {
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ],
    }
  );

  return (
    <span {...attributes} css={{ position: 'relative', display: 'inline-block' }}>
      <a {...trigger.props} ref={trigger.ref} href={url}>
        {children}
      </a>
      {((selected && focused) || focusedInInlineDialog) && (
        <InlineDialog
          {...dialog.props}
          ref={dialog.ref}
          onFocus={() => {
            setFocusedInInlineDialog(true);
          }}
          onBlur={() => {
            setFocusedInInlineDialog(false);
          }}
        >
          <ToolbarGroup>
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
                <ToolbarButton
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
                </ToolbarButton>
              )}
            </Tooltip>
            <ToolbarSeparator />
            <Tooltip content="Unlink" weight="subtle">
              {attrs => (
                <ToolbarButton
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
                </ToolbarButton>
              )}
            </Tooltip>
          </ToolbarGroup>
        </InlineDialog>
      )}
    </span>
  );
};

let linkIcon = <LinkIcon size="small" />;

const LinkButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  const editor = useSlate();
  const isActive = isLinkActive(editor);
  const isDisabled = !isActive && (!editor.selection || Range.isCollapsed(editor.selection));

  return (
    <Tooltip content="Link" weight="subtle">
      {attrs => (
        <ToolbarButton
          isDisabled={isDisabled}
          isSelected={isActive}
          onMouseDown={event => {
            event.preventDefault();
            wrapLink(editor, '');
          }}
          {...attrs}
          {...props}
        >
          {linkIcon}
        </ToolbarButton>
      )}
    </Tooltip>
  );
};

export const linkButton = <LinkButton />;

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
