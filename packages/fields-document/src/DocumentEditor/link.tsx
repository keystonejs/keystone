/** @jsxRuntime classic */
/** @jsx jsx */

import { ReactEditor, RenderElementProps, useFocused, useSelected } from 'slate-react';
import { Editor, Node, Range, Transforms } from 'slate';
import { forwardRef, memo, useMemo, useState } from 'react';

import { jsx, Portal, useTheme } from '@keystone-ui/core';
import { useControlledPopover } from '@keystone-ui/popover';
import { Tooltip } from '@keystone-ui/tooltip';
import { LinkIcon } from '@keystone-ui/icons/icons/LinkIcon';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';
import { ExternalLinkIcon } from '@keystone-ui/icons/icons/ExternalLinkIcon';

import { DocumentFeatures } from '../views';
import { InlineDialog, ToolbarButton, ToolbarGroup, ToolbarSeparator } from './primitives';
import {
  EditorAfterButIgnoringingPointsWithNoContent,
  isElementActive,
  useElementWithSetNodes,
  useForceValidation,
  useStaticEditor,
} from './utils';
import { getAncestorComponentChildFieldDocumentFeatures, useToolbarState } from './toolbar-state';
import { useEventCallback } from './utils';
import { ComponentBlock } from './component-blocks/api';
import { isValidURL } from './isValidURL';

const isLinkActive = (editor: Editor) => {
  return isElementActive(editor, 'link');
};

export const wrapLink = (editor: Editor, url: string) => {
  if (isLinkActive(editor)) {
    Transforms.unwrapNodes(editor, { match: n => n.type === 'link' });
    return;
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);

  if (isCollapsed) {
    Transforms.insertNodes(editor, {
      type: 'link',
      href: url,
      children: [{ text: url }],
    });
  } else {
    Transforms.wrapNodes(
      editor,
      {
        type: 'link',
        href: url,
        children: [{ text: '' }],
      },
      { split: true }
    );
  }
};

export const LinkElement = ({
  attributes,
  children,
  element: __elementForGettingPath,
}: RenderElementProps & { element: { type: 'link' } }) => {
  const { typography } = useTheme();
  const editor = useStaticEditor();
  const [currentElement, setNode] = useElementWithSetNodes(editor, __elementForGettingPath);
  const href = currentElement.href;

  const selected = useSelected();
  const focused = useFocused();
  const [focusedInInlineDialog, setFocusedInInlineDialog] = useState(false);
  const [localForceValidation, setLocalForceValidation] = useState(false);
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
  const forceValidation = useForceValidation();
  const showInvalidState = isValidURL(href) ? false : forceValidation || localForceValidation;
  return (
    <span {...attributes} css={{ position: 'relative', display: 'inline-block' }}>
      <a
        {...trigger.props}
        css={{ color: showInvalidState ? 'red' : undefined }}
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
              setLocalForceValidation(true);
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
              {showInvalidState && <span css={{ color: 'red' }}>Please enter a valid URL</span>}
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

const markdownLinkPattern = /(^|\s)\[(.+?)\]\((\S+)\)$/;

export function withLink(
  editorDocumentFeatures: DocumentFeatures,
  componentBlocks: Record<string, ComponentBlock>,
  editor: Editor
): Editor {
  const { insertText, isInline, normalizeNode } = editor;

  editor.isInline = element => {
    return element.type === 'link' ? true : isInline(element);
  };

  if (editorDocumentFeatures.links) {
    editor.insertText = text => {
      insertText(text);
      if (text !== ')' || !editor.selection) return;
      const startOfBlock = Editor.start(
        editor,
        Editor.above(editor, { match: node => Editor.isBlock(editor, node) })![1]
      );

      const startOfBlockToEndOfShortcutString = Editor.string(editor, {
        anchor: editor.selection.anchor,
        focus: startOfBlock,
      });
      const match = markdownLinkPattern.exec(startOfBlockToEndOfShortcutString);
      if (!match) return;
      const ancestorComponentChildFieldDocumentFeatures =
        getAncestorComponentChildFieldDocumentFeatures(
          editor,
          editorDocumentFeatures,
          componentBlocks
        );
      if (ancestorComponentChildFieldDocumentFeatures?.documentFeatures.links === false) {
        return;
      }
      const [, maybeWhitespace, linkText, href] = match;
      // by doing this, the insertText(')') above will happen in a different undo than the link replacement
      // so that means that when someone does an undo after this
      // it will undo to the state of "[content](link)" rather than "[content](link" (note the missing closing bracket)
      editor.history.undos.push([]);
      const startOfShortcut =
        match.index === 0
          ? startOfBlock
          : EditorAfterButIgnoringingPointsWithNoContent(editor, startOfBlock, {
              distance: match.index,
            })!;
      const startOfLinkText = EditorAfterButIgnoringingPointsWithNoContent(
        editor,
        startOfShortcut,
        {
          distance: maybeWhitespace === '' ? 1 : 2,
        }
      )!;
      const endOfLinkText = EditorAfterButIgnoringingPointsWithNoContent(editor, startOfLinkText, {
        distance: linkText.length,
      })!;

      Transforms.delete(editor, {
        at: { anchor: endOfLinkText, focus: editor.selection.anchor },
      });
      Transforms.delete(editor, {
        at: { anchor: startOfShortcut, focus: startOfLinkText },
      });

      Transforms.wrapNodes(
        editor,
        { type: 'link', href, children: [] },
        { at: { anchor: editor.selection.anchor, focus: startOfShortcut }, split: true }
      );
      const nextNode = Editor.next(editor);
      if (nextNode) {
        Transforms.select(editor, nextNode[1]);
      }
    };
  }

  editor.normalizeNode = ([node, path]) => {
    if (node.type === 'link' && Node.string(node) === '') {
      Transforms.unwrapNodes(editor, { at: path });
      return;
    }
    normalizeNode([node, path]);
  };

  return editor;
}
