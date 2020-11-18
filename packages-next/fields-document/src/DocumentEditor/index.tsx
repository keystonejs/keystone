/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { KeyboardEvent } from 'react';
import isHotkey from 'is-hotkey';
import { useCallback, useMemo } from 'react';
import { Editor, Node, Range, Transforms, createEditor } from 'slate';
import { Editable, ReactEditor, RenderLeafProps, Slate, withReact } from 'slate-react';
import { withHistory } from 'slate-history';

import { withPanel } from './panel';
import { withParagraphs } from './paragraphs';
import { withQuote } from './quote';
import { withLink } from './link';

import { withColumns } from './columns';

import { Mark, toggleMark } from './utils';
import { Toolbar } from './Toolbar';
import { renderElement } from './render-element';
import { withHeading } from './heading';
import { isListType, withList } from './lists';
import { ComponentBlockProvider, withComponentBlocks } from './component-blocks';
import { withBlockquote } from './blockquote';
import { ComponentBlock } from '../component-blocks';

const HOTKEYS: Record<string, Mark> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
};

const getKeyDownHandler = (editor: ReactEditor) => (event: KeyboardEvent) => {
  for (const hotkey in HOTKEYS) {
    if (isHotkey(hotkey, event.nativeEvent)) {
      event.preventDefault();
      toggleMark(editor, HOTKEYS[hotkey]);
    }
  }
  if (event.key === 'Tab' && editor.selection && Range.isCollapsed(editor.selection)) {
    const block = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
    });

    if (block && block[0].type === 'list-item') {
      event.preventDefault();
      if (event.shiftKey) {
        Transforms.unwrapNodes(editor, {
          match: node => isListType(node.type as string),
          split: true,
        });
      } else {
        const type = Editor.parent(editor, block[1])[0].type as string;
        Transforms.wrapNodes(editor, {
          type,
          children: [],
        });
      }
    }
  }
};

/* Leaf Elements */

const Leaf = ({ leaf, children, attributes }: RenderLeafProps) => {
  const { underline, strikethrough, bold, italic } = leaf;

  const textDecoration = `${underline ? 'underline' : ''} ${strikethrough ? 'line-through' : ''}`;

  return (
    <span
      {...attributes}
      style={{
        fontWeight: bold ? 'bold' : undefined,
        fontStyle: italic ? 'italic' : undefined,
        textDecoration,
      }}
    >
      {children}
    </span>
  );
};

export function DocumentEditor({
  autoFocus,
  onChange,
  value,
  componentBlocks,
}: {
  autoFocus?: boolean;
  onChange: undefined | ((value: Node[]) => void);
  value: Node[];
  componentBlocks: Record<string, ComponentBlock>;
}) {
  const editor = useMemo(
    () =>
      withList(
        withHeading(
          withComponentBlocks(
            componentBlocks,
            withParagraphs(
              withColumns(
                withBlockquote(
                  withLink(withQuote(withPanel(withHistory(withReact(createEditor())))))
                )
              )
            )
          )
        )
      ),
    []
  );

  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />;
  }, []);

  const onKeyDown = useMemo(() => getKeyDownHandler(editor), [editor]);

  useMemo(() => {
    findDuplicateNodes(value);
  }, [value]);

  return (
    <ComponentBlockProvider value={componentBlocks}>
      <Slate
        editor={editor}
        value={value}
        onChange={value => {
          onChange?.(value);
        }}
      >
        <Toolbar />
        <Editable
          css={styles}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          readOnly={onChange === undefined}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      </Slate>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </ComponentBlockProvider>
  );
}

const orderedListStyles = ['lower-roman', 'decimal', 'lower-alpha'];
const unorderedListStyles = ['square', 'disc', 'circle'];

let styles: any = {};

let listDepth = 10;

while (listDepth--) {
  let arr = Array.from({ length: listDepth });
  styles[arr.map(() => `ol`).join(' ')] = {
    listStyle: orderedListStyles[listDepth % 3],
  };
  styles[arr.map(() => `ul`).join(' ')] = {
    listStyle: unorderedListStyles[listDepth % 3],
  };
}

/**
 * Slate freaks out(which is quite expected ofc) if the
 * same nodes(as in ===, same shape is fine) are in the tree
 * multiple times so we'll validate it here to avoid running into it
 * strange and hard to debug problems
 */
function findDuplicateNodes(nodes: Node[], found: WeakSet<object> = new WeakSet()) {
  for (const node of nodes) {
    if (found.has(node)) {
      throw new Error('Duplicate node found: ' + JSON.stringify(node));
    }
    found.add(node);
    if (Array.isArray(node.children)) {
      findDuplicateNodes(node.children, found);
    }
  }
}
