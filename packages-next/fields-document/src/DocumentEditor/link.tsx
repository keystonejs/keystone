/** @jsx jsx */

import { ReactEditor, RenderElementProps, useFocused, useSelected } from 'slate-react';
import { Node, Range, Transforms } from 'slate';
import { forwardRef, memo, useMemo, useState } from 'react';
import isUrl from 'is-url';

import { jsx, Portal, useTheme } from '@keystone-ui/core';
import { useControlledPopover } from '@keystone-ui/popover';
import { Tooltip } from '@keystone-ui/tooltip';
import { LinkIcon } from '@keystone-ui/icons/icons/LinkIcon';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';
import { ExternalLinkIcon } from '@keystone-ui/icons/icons/ExternalLinkIcon';

import { InlineDialog, ToolbarButton, ToolbarGroup, ToolbarSeparator } from './primitives';
import { isBlockActive, useElementWithSetNodes, useStaticEditor } from './utils';
import { useToolbarState } from './toolbar-state';
import { useEventCallback } from './utils';

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

export const LinkElement = ({
  attributes,
  children,
  element: __elementForGettingPath,
}: RenderElementProps) => {
  const { typography } = useTheme();
  const editor = useStaticEditor();
  const [currentElement, setNode] = useElementWithSetNodes(editor, __elementForGettingPath);
  const href = currentElement.href as string;

  const selected = useSelected();
  const focused = useFocused();
  const [focusedInInlineDialog, setFocusedInInlineDialog] = useState(false);
  const { dialog, trigger } = useControlledPopover(
    {
      isOpen: (selected && focused) || focusedInInlineDialog,
      onClose: () => {},
    },
    {
      placement: 'bottom-start',
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
  const unlink = useEventCallback(() => {
    Transforms.unwrapNodes(editor, {
      at: ReactEditor.findPath(editor, __elementForGettingPath),
    });
  });
  const isValidURL = isUrl(href);
  return (
    <span {...attributes} css={{ position: 'relative', display: 'inline-block' }}>
      <a
        {...trigger.props}
        css={{ color: isValidURL ? undefined : 'red' }}
        ref={trigger.ref}
        href={href}
      >
        {children}
      </a>
      {((selected && focused) || focusedInInlineDialog) && (
        <Portal>
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
            <div css={{ display: 'flex', flexDirection: 'column' }}>
              <ToolbarGroup>
                <input
                  css={{ fontSize: typography.fontSize.small, width: 240 }}
                  value={href}
                  onChange={event => {
                    setNode({ href: event.target.value });
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
                      {externalLinkIcon}
                    </ToolbarButton>
                  )}
                </Tooltip>
                {separator}
                <UnlinkButton onUnlink={unlink} />
              </ToolbarGroup>
              {!isValidURL && <span css={{ color: 'red' }}>Please enter a valid URL</span>}
            </div>
          </InlineDialog>
        </Portal>
      )}
    </span>
  );
};

const separator = <ToolbarSeparator />;
const externalLinkIcon = <ExternalLinkIcon size="small" />;

const UnlinkButton = memo(function UnlinkButton({ onUnlink }: { onUnlink: () => void }) {
  return (
    <Tooltip content="Unlink" weight="subtle">
      {attrs => (
        <ToolbarButton
          variant="destructive"
          onMouseDown={event => {
            event.preventDefault();
            onUnlink();
          }}
          {...attrs}
        >
          <Trash2Icon size="small" />
        </ToolbarButton>
      )}
    </Tooltip>
  );
});

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
