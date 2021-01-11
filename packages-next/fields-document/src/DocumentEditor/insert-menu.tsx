/** @jsx jsx */
import { jsx, Portal } from '@keystone-ui/core';
import { useControlledPopover } from '@keystone-ui/popover';
import { Fragment, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Transforms, Text, Editor, Path, Point, Node } from 'slate';
import { ReactEditor } from 'slate-react';
import { ComponentBlockContext, insertComponentBlock } from './component-blocks';
import { ComponentBlock } from './component-blocks/api';
import { InlineDialog, ToolbarButton } from './primitives';
import { Relationships, useDocumentFieldRelationships } from './relationship';
import { matchSorter } from 'match-sorter';
import { useToolbarState } from './toolbar-state';

let noop = () => {};

type Option = {
  label: string;
  insert: (editor: ReactEditor) => void;
};

function getOptions(
  componentBlocks: Record<string, ComponentBlock>,
  relationships: Relationships
): Option[] {
  return [
    ...Object.entries(relationships)
      .filter(
        (x): x is [string, Extract<Relationships[string], { kind: 'inline' }>] =>
          x[1].kind === 'inline'
      )
      .map(([relationship, { label }]) => ({
        label,
        insert: (editor: ReactEditor) => {
          Transforms.insertNodes(editor, {
            type: 'relationship',
            relationship,
            children: [{ text: '' }],
          });
        },
      })),
    ...Object.keys(componentBlocks).map(key => ({
      label: componentBlocks[key].label,
      insert: (editor: ReactEditor) => {
        insertComponentBlock(editor, componentBlocks, key, relationships);
      },
    })),
  ];
}

function insertOption(editor: ReactEditor, text: Text, option: Option) {
  const path = ReactEditor.findPath(editor, text);
  Transforms.delete(editor, { at: path });
  option.insert(editor);
}

export function InsertMenu({ children, text }: { children: ReactNode; text: Text }) {
  const {
    editor,
    relationships: { isDisabled: relationshipsDisabled },
  } = useToolbarState();
  const { dialog, trigger } = useControlledPopover(
    { isOpen: true, onClose: noop },
    { placement: 'bottom-start' }
  );
  const componentBlocks = useContext(ComponentBlockContext);
  const relationships = useDocumentFieldRelationships();
  const options = matchSorter(
    getOptions(componentBlocks, relationshipsDisabled ? {} : relationships),
    text.text.slice(1),
    {
      keys: ['label'],
    }
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  if (options.length && selectedIndex >= options.length) {
    setSelectedIndex(0);
  }

  const stateRef = useRef({ selectedIndex, options, text });

  useEffect(() => {
    stateRef.current = { selectedIndex, options, text };
  });

  useEffect(() => {
    const domNode = ReactEditor.toDOMNode(editor, editor);
    let listener = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      switch (event.key) {
        case 'ArrowDown': {
          if (stateRef.current.options.length) {
            event.preventDefault();
            setSelectedIndex(
              stateRef.current.selectedIndex === stateRef.current.options.length - 1
                ? 0
                : stateRef.current.selectedIndex + 1
            );
          }
          return;
        }
        case 'ArrowUp': {
          if (stateRef.current.options.length) {
            event.preventDefault();
            setSelectedIndex(
              stateRef.current.selectedIndex === 0
                ? stateRef.current.options.length - 1
                : stateRef.current.selectedIndex - 1
            );
          }
          return;
        }
        case 'Enter': {
          const option = stateRef.current.options[stateRef.current.selectedIndex];
          if (option) {
            insertOption(editor, stateRef.current.text, option);
            event.preventDefault();
          }
          return;
        }
        case 'Escape': {
          const path = ReactEditor.findPath(editor, text);
          Transforms.unsetNodes(editor, 'insertMenu', { at: path });
          event.preventDefault();
          return;
        }
      }
    };
    domNode.addEventListener('keydown', listener);
    return () => {
      domNode.removeEventListener('keydown', listener);
    };
  }, [editor]);
  return (
    <Fragment>
      <span {...trigger.props} css={{ color: 'blue' }} ref={trigger.ref}>
        {children}
      </span>
      <Portal>
        <InlineDialog
          contentEditable={false}
          {...dialog.props}
          css={{ display: options.length ? undefined : 'none', userSelect: 'none' }}
          ref={dialog.ref}
        >
          {options.map((option, index) => (
            <ToolbarButton
              key={option.label}
              isPressed={index === selectedIndex}
              onMouseEnter={() => {
                setSelectedIndex(index);
              }}
              onClick={() => {
                insertOption(editor, text, option);
              }}
            >
              {option.label}
            </ToolbarButton>
          ))}
        </InlineDialog>
      </Portal>
    </Fragment>
  );
}

const nodesWithoutInsertMenu = new WeakSet<Node>();

function findPathWithInsertMenu(node: Node, path: Path): Path | undefined {
  if (Text.isText(node)) {
    return node.insertMenu ? path : undefined;
  }
  for (const [index, child] of node.children.entries()) {
    if (nodesWithoutInsertMenu.has(child)) continue;
    let maybePath = findPathWithInsertMenu(child, [...path, index]);
    if (maybePath) {
      return maybePath;
    }
    nodesWithoutInsertMenu.add(child);
  }
}

function removeInsertMenuMarkWhenOutsideOfSelection(editor: ReactEditor) {
  const marks = Editor.marks(editor);
  const path = findPathWithInsertMenu(editor, []);
  if (
    path &&
    !marks?.insertMenu &&
    (!editor.selection ||
      !Path.equals(editor.selection.anchor.path, path) ||
      !Path.equals(editor.selection.focus.path, path))
  ) {
    Transforms.unsetNodes(editor, 'insertMenu', { at: path });
    return true;
  }
  return false;
}

export function withInsertMenu(editor: ReactEditor) {
  const { normalizeNode, apply, insertText } = editor;
  editor.normalizeNode = ([node, path]) => {
    if (Text.isText(node) && node.insertMenu) {
      if (node.text[0] !== '/') {
        Transforms.unsetNodes(editor, 'insertMenu', { at: path });
        return;
      }
      const whitespaceMatch = /\s/.exec(node.text);
      if (whitespaceMatch) {
        Transforms.unsetNodes(editor, 'insertMenu', {
          at: {
            anchor: { path, offset: whitespaceMatch.index },
            focus: Editor.end(editor, path),
          },
          match: Text.isText,
          split: true,
        });
        return;
      }
    }
    if (removeInsertMenuMarkWhenOutsideOfSelection(editor)) {
      return;
    }
    normalizeNode([node, path]);
  };

  editor.apply = op => {
    apply(op);
    // we're calling this here AND in normalizeNode
    // because normalizeNode won't be called on selection changes
    // but apply will
    // we're still calling this from normalizeNode though because we want it to happen
    // when force normalization happens
    removeInsertMenuMarkWhenOutsideOfSelection(editor);
  };

  editor.insertText = text => {
    insertText(text);
    if (editor.selection && text === '/') {
      const startOfBlock = Editor.start(
        editor,
        Editor.above(editor, { match: node => Editor.isBlock(editor, node) })![1]
      );
      const before = Editor.before(editor, editor.selection.anchor, { unit: 'character' });
      if (
        before &&
        (Point.equals(startOfBlock, before) ||
          (before.offset !== 0 &&
            /\s/.test((Node.get(editor, before.path)!.text as string)[before.offset - 1])))
      ) {
        Transforms.setNodes(
          editor,
          { insertMenu: true },
          {
            at: { anchor: before, focus: editor.selection.anchor },
            match: Text.isText,
            split: true,
          }
        );
      }
    }
  };
  return editor;
}
