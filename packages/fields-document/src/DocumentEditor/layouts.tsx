/** @jsxRuntime classic */
/** @jsx jsx */

import { createContext, useContext, useMemo } from 'react';
import { Editor, Element, Node, Transforms, Range, Point } from 'slate';
import { ReactEditor, RenderElementProps, useFocused, useSelected } from 'slate-react';

import { jsx, useTheme } from '@keystone-ui/core';
import { Tooltip } from '@keystone-ui/tooltip';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';

import { ColumnsIcon } from '@keystone-ui/icons/icons/ColumnsIcon';
import { DocumentFeatures } from '../views';
import { InlineDialog, ToolbarButton, ToolbarGroup, ToolbarSeparator } from './primitives';
import { paragraphElement } from './paragraphs';
import {
  insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading,
  isElementActive,
  moveChildren,
  useStaticEditor,
} from './utils';
import { useToolbarState } from './toolbar-state';

const LayoutOptionsContext = createContext<[number, ...number[]][]>([]);

export const LayoutOptionsProvider = LayoutOptionsContext.Provider;

// UI Components
export const LayoutContainer = ({
  attributes,
  children,
  element,
}: RenderElementProps & { element: { type: 'layout' } }) => {
  const { spacing } = useTheme();
  const focused = useFocused();
  const selected = useSelected();
  const editor = useStaticEditor();

  const layout = element.layout;
  const layoutOptions = useContext(LayoutOptionsContext);

  return (
    <div
      css={{
        marginBottom: spacing.medium,
        marginTop: spacing.medium,
        position: 'relative',
      }}
      {...attributes}
    >
      <div
        css={{
          columnGap: spacing.small,
          display: 'grid',
          gridTemplateColumns: layout.map(x => `${x}fr`).join(' '),
        }}
      >
        {children}
      </div>
      {focused && selected && (
        <InlineDialog isRelative>
          <ToolbarGroup>
            {layoutOptions.map((layoutOption, i) => (
              <ToolbarButton
                isSelected={layoutOption.toString() === layout.toString()}
                key={i}
                onMouseDown={event => {
                  event.preventDefault();
                  const path = ReactEditor.findPath(editor, element);
                  Transforms.setNodes(
                    editor,
                    {
                      type: 'layout',
                      layout: layoutOption,
                    },
                    { at: path }
                  );
                }}
              >
                {makeLayoutIcon(layoutOption)}
              </ToolbarButton>
            ))}
            <ToolbarSeparator />
            <Tooltip content="Remove" weight="subtle">
              {attrs => (
                <ToolbarButton
                  variant="destructive"
                  onMouseDown={event => {
                    event.preventDefault();
                    const path = ReactEditor.findPath(editor, element);
                    Transforms.removeNodes(editor, { at: path });
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
    </div>
  );
};

export const LayoutArea = ({ attributes, children }: RenderElementProps) => {
  const { colors, radii, spacing } = useTheme();
  return (
    <div
      css={{
        border: `2px dashed ${colors.border}`,
        borderRadius: radii.small,
        paddingLeft: spacing.medium,
        paddingRight: spacing.medium,
      }}
      {...attributes}
    >
      {children}
    </div>
  );
};

export const insertLayout = (editor: Editor, layout: [number, ...number[]]) => {
  insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, [
    {
      type: 'layout',
      layout,
      children: [
        { type: 'layout-area', children: [{ type: 'paragraph', children: [{ text: '' }] }] },
      ],
    },
  ]);
  const layoutEntry = Editor.above(editor, { match: x => x.type === 'layout' });
  if (layoutEntry) {
    Transforms.select(editor, [...layoutEntry[1], 0]);
  }
};

// Plugin
export function withLayouts(editor: Editor): Editor {
  const { normalizeNode, deleteBackward } = editor;
  editor.deleteBackward = unit => {
    if (
      editor.selection &&
      Range.isCollapsed(editor.selection) &&
      // this is just an little optimisation
      // we're only doing things if we're at the start of a layout area
      // and the start of anything will always be offset 0
      // so we'll bailout if we're not at offset 0
      editor.selection.anchor.offset === 0
    ) {
      const [aboveNode, abovePath] = Editor.above(editor, {
        match: node => node.type === 'layout-area',
      }) || [editor, []];
      if (
        aboveNode.type === 'layout-area' &&
        Point.equals(Editor.start(editor, abovePath), editor.selection.anchor)
      ) {
        return;
      }
    }
    deleteBackward(unit);
  };
  editor.normalizeNode = entry => {
    const [node, path] = entry;

    if (Element.isElement(node) && node.type === 'layout') {
      if (node.layout === undefined) {
        Transforms.unwrapNodes(editor, { at: path });
        return;
      }
      if (node.children.length < node.layout.length) {
        Transforms.insertNodes(
          editor,
          Array.from({
            length: node.layout.length - node.children.length,
          }).map(() => ({
            type: 'layout-area',
            children: [paragraphElement()],
          })),
          {
            at: [...path, node.children.length],
          }
        );
        return;
      }
      if (node.children.length > node.layout.length) {
        Array.from({
          length: node.children.length - node.layout.length,
        })
          .map((_, i) => i)
          .reverse()
          .forEach(i => {
            const layoutAreaToRemovePath = [...path, i + node.layout.length];
            const child = node.children[i + node.layout.length] as Element;
            moveChildren(
              editor,
              layoutAreaToRemovePath,
              [
                ...path,
                node.layout.length - 1,
                (node.children[node.layout.length - 1] as Element).children.length,
              ],
              node => node.type !== 'paragraph' || Node.string(child) !== ''
            );

            Transforms.removeNodes(editor, {
              at: layoutAreaToRemovePath,
            });
          });
        return;
      }
    }
    normalizeNode(entry);
  };
  return editor;
}

// Utils
// ------------------------------

function makeLayoutIcon(ratios: number[]) {
  const size = 16;

  const element = (
    <div
      role="img"
      css={{
        display: 'grid',
        gridTemplateColumns: ratios.map(r => `${r}fr`).join(' '),
        gap: 2,
        width: size,
        height: size,
      }}
    >
      {ratios.map((_, i) => {
        return <div key={i} css={{ backgroundColor: 'currentcolor', borderRadius: 1 }} />;
      })}
    </div>
  );

  return element;
}

const layoutsIcon = <ColumnsIcon size="small" />;

export const LayoutsButton = ({ layouts }: { layouts: DocumentFeatures['layouts'] }) => {
  const {
    editor,
    layouts: { isSelected },
  } = useToolbarState();
  return useMemo(
    () => (
      <Tooltip content="Layouts" weight="subtle">
        {attrs => (
          <ToolbarButton
            isSelected={isSelected}
            onMouseDown={event => {
              event.preventDefault();
              if (isElementActive(editor, 'layout')) {
                Transforms.unwrapNodes(editor, {
                  match: node => node.type === 'layout',
                });
                return;
              }
              insertLayout(editor, layouts[0]);
            }}
            {...attrs}
          >
            {layoutsIcon}
          </ToolbarButton>
        )}
      </Tooltip>
    ),
    [editor, isSelected, layouts]
  );
};
