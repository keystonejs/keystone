/** @jsx jsx */

import { ReactEditor, RenderElementProps, useFocused, useSelected } from 'slate-react';
import { Node, Range, Transforms } from 'slate';
import { forwardRef, useMemo, useState } from 'react';
// @ts-ignore
import isUrl from 'is-url';

import { jsx, useTheme } from '@keystone-ui/core';
import { useControlledPopover } from '@keystone-ui/popover';
import { Tooltip } from '@keystone-ui/tooltip';
import { LinkIcon } from '@keystone-ui/icons/icons/LinkIcon';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';
import { ExternalLinkIcon } from '@keystone-ui/icons/icons/ExternalLinkIcon';

import { InlineDialog, ToolbarButton, ToolbarGroup, ToolbarSeparator } from './primitives';
import { isBlockActive, useStaticEditor } from './utils';
import { useToolbarState } from './toolbar-state';

const isLinkActive = (editor: ReactEditor) => {
  return isBlockActive(editor, 'link');
};

const wrapLink = (editor: ReactEditor, url: string) => {
  if (isLinkActive(editor)) {
    Transforms.unwrapNodes(editor, { match: n => n.type === 'link' });
    return;
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: 'link',
    href: url,
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
  const href = element.href as string;
  const editor = useStaticEditor();

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
      <a {...trigger.props} ref={trigger.ref} href={href}>
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
              value={href}
              onChange={event => {
                Transforms.setNodes(
                  editor,
                  { href: event.target.value },
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
                  href={href}
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

const LinkButton = forwardRef<HTMLButtonElement, {}>(function LinkButton(props, ref) {
  const {
    editor,
    links: { isDisabled, isSelected },
  } = useToolbarState();
  return useMemo(
    () => (
      <ToolbarButton
        ref={ref}
        isDisabled={isDisabled}
        isSelected={isSelected}
        onMouseDown={event => {
          event.preventDefault();
          wrapLink(editor, '');
        }}
        {...props}
      >
        {linkIcon}
      </ToolbarButton>
    ),
    [isSelected, isDisabled, editor, props, ref]
  );
});

export const linkButton = (
  <Tooltip content="Link" weight="subtle">
    {attrs => <LinkButton {...attrs} />}
  </Tooltip>
);

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
      insertData(data);
    }
  };

  return editor;
};
