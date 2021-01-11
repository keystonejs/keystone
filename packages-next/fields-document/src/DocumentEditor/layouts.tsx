/** @jsx jsx */

import { createContext, useContext, useMemo } from 'react';
import { Editor, Element, Node, Transforms, Range, Point } from 'slate';
import { ReactEditor, RenderElementProps, useFocused, useSelected } from 'slate-react';

import { jsx, useTheme } from '@keystone-ui/core';
import { Tooltip } from '@keystone-ui/tooltip';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';

import { InlineDialog, ToolbarButton, ToolbarGroup, ToolbarSeparator } from './primitives';
import { paragraphElement } from './paragraphs';
import { isBlockActive, moveChildren, useStaticEditor } from './utils';
import { DocumentFeatures } from '../views';
import { ColumnsIcon } from '@keystone-ui/icons/icons/ColumnsIcon';
import { useToolbarState } from './toolbar-state';

const LayoutOptionsContext = createContext<[number, ...number[]][]>([]);

export const LayoutOptionsProvider = LayoutOptionsContext.Provider;

// UI Components
export const LayoutContainer = ({ attributes, children, element }: RenderElementProps) => {
  const { spacing } = useTheme();
  const focused = useFocused();
  const selected = useSelected();
  const editor = useStaticEditor();

  const layout = element.layout as number[];
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
                  const cols = {
                    type: 'layout',
                    layout: layoutOption,
                  };
                  Transforms.setNodes(editor, cols, { at: path });
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

const isInsideLayout = (editor: ReactEditor) => {
  return isBlockActive(editor, 'layout');
};

function firstNonEditorRootNodeEntry(editor: Editor) {
  for (const entry of Editor.nodes(editor, {
    reverse: true,
  })) {
    if (
      Element.isElement(entry[0]) &&
      // is a child of the editor
      entry[1].length === 1
    ) {
      return entry;
    }
  }
}

const insertLayout = (editor: ReactEditor, layout: [number, ...number[]]) => {
  if (isInsideLayout(editor)) {
    Transforms.unwrapNodes(editor, {
      match: node => node.type === 'layout',
    });
    return;
  }
  const entry = firstNonEditorRootNodeEntry(editor);
  if (entry) {
    Transforms.insertNodes(
      editor,
      [
        {
          type: 'layout',
          layout,
          children: [],
        },
      ],
      { at: [entry[1][0] + 1] }
    );
    Transforms.select(editor, [entry[1][0] + 1, 0]);
  }
};

// Plugin
export const withLayouts = (editor: ReactEditor) => {
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
      let layout = node.layout as number[];
      if (node.layout === undefined) {
        Transforms.unwrapNodes(editor, { at: path });
        return;
      }
      if (node.children.length < layout.length) {
        Transforms.insertNodes(
          editor,
          Array.from({
            length: layout.length - node.children.length,
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
      if (node.children.length > layout.length) {
        Array.from({
          length: node.children.length - layout.length,
        })
          .map((_, i) => i)
          .reverse()
          .forEach(i => {
            const layoutAreaToRemovePath = [...path, i + layout.length];
            const child = node.children[i + layout.length] as Element;
            moveChildren(
              editor,
              layoutAreaToRemovePath,
              [
                ...path,
                layout.length - 1,
                (node.children[layout.length - 1] as Element).children.length,
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
};

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
