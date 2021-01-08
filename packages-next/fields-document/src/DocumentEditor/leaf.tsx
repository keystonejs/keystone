/** @jsx jsx */

import { jsx, Portal, useTheme } from '@keystone-ui/core';
import { useControlledPopover } from '@keystone-ui/popover';
import { Fragment, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Point, Range, Editor, Transforms } from 'slate';
import { ReactEditor, RenderLeafProps, useSelected, useSlate } from 'slate-react';
import { ComponentBlockContext, insertComponentBlock } from './component-blocks';
import { ComponentBlock } from './component-blocks/api';
import { InlineDialog, ToolbarButton } from './primitives';
import { Relationships, useDocumentFieldRelationships } from './relationship';
import { useStaticEditor } from './utils';
import { matchSorter } from 'match-sorter';

function Placeholder({ placeholder, children }: { placeholder: string; children: ReactNode }) {
  const [width, setWidth] = useState(0);
  return (
    <span css={{ position: 'relative', display: 'inline-block', width }}>
      <span
        contentEditable={false}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          display: 'inline-block',
          left: 0,
          top: 0,
          maxWidth: '100%',
          whiteSpace: 'nowrap',
          opacity: '0.5',
          userSelect: 'none',
          fontStyle: 'normal',
          fontWeight: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
        }}
      >
        <span
          ref={node => {
            if (node) {
              const offsetWidth = node.offsetWidth;
              if (offsetWidth !== width) {
                setWidth(offsetWidth);
              }
            }
          }}
        >
          {placeholder as string}
        </span>
      </span>
      {children}
    </span>
  );
}

let noop = () => {};

type Option = {
  label: string;
  insert: (editor: ReactEditor, point: Point) => void;
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
        insert: (editor: ReactEditor, point: Point) => {
          Transforms.insertNodes(
            editor,
            { type: 'relationship', relationship, children: [] },
            { at: point }
          );
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

function SelectedInsertMenu({
  children,
  search,
  range,
}: {
  children: ReactNode;
  search: string;
  range: Range;
  kind: 'start' | 'inline';
}) {
  const editor = useStaticEditor();
  const { dialog, trigger } = useControlledPopover(
    { isOpen: true, onClose: noop },
    { placement: 'bottom-start' }
  );
  const componentBlocks = useContext(ComponentBlockContext);
  const relationships = useDocumentFieldRelationships();
  const options = matchSorter(getOptions(componentBlocks, relationships), search, {
    keys: ['label'],
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (options.length && selectedIndex >= options.length) {
    setSelectedIndex(0);
  }

  const stateRef = useRef({ selectedIndex, options });

  useEffect(() => {
    stateRef.current = { selectedIndex, options };
  });

  useEffect(() => {
    const domNode = ReactEditor.toDOMNode(editor, editor);
    let listener = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          setSelectedIndex(
            stateRef.current.selectedIndex === stateRef.current.options.length - 1
              ? 0
              : stateRef.current.selectedIndex + 1
          );
          return;
        }
        case 'ArrowUp': {
          event.preventDefault();
          setSelectedIndex(
            stateRef.current.selectedIndex === 0
              ? stateRef.current.options.length - 1
              : stateRef.current.selectedIndex - 1
          );
          return;
        }
        case 'Enter': {
          const option = stateRef.current.options[stateRef.current.selectedIndex];
          if (option) {
            const pointRef = Editor.pointRef(editor, Range.start(range));
            Transforms.delete(editor, { at: range });
            const point = pointRef.unref();
            if (point) {
              option.insert(editor, point);
            }
            event.preventDefault();
          }
          return;
        }
      }
    };
    domNode.addEventListener('keydown', listener);
    return () => {
      domNode.removeEventListener('keydown', listener);
    };
  }, []);
  return (
    <Fragment>
      <span {...trigger.props} ref={trigger.ref}>
        {children}
      </span>
      <Portal>
        <InlineDialog
          {...dialog.props}
          css={{ display: options.length ? undefined : 'none' }}
          ref={dialog.ref}
        >
          {options.map((x, index) => (
            <ToolbarButton
              key={x.label}
              isPressed={index === selectedIndex}
              onClick={() => {
                const pointRef = Editor.pointRef(editor, Range.start(range));
                Transforms.delete(editor, { at: range });
                const point = pointRef.unref();
                if (point) {
                  x.insert(editor, point);
                }
              }}
            >
              {x.label}
            </ToolbarButton>
          ))}
        </InlineDialog>
      </Portal>
    </Fragment>
  );
}

function shouldShowInsertMenu(editor: ReactEditor, range: Range) {
  if (editor.selection) {
    return Range.includes(range, Range.start(editor.selection));
  }
  return false;
}

function InsertMenu({
  children,
  range,
  kind,
  search,
}: {
  children: ReactNode;
  range: Range;
  kind: 'start' | 'inline';
  search: string;
}) {
  const editor = useSlate();
  const isSelected = useSelected();
  const showMenu = isSelected ? shouldShowInsertMenu(editor, range) : false;

  return showMenu ? (
    <SelectedInsertMenu range={range} search={search} kind={kind}>
      {children}
    </SelectedInsertMenu>
  ) : (
    <span> {children}</span>
  );
}

const Leaf = ({ leaf, children, attributes }: RenderLeafProps) => {
  const { colors, radii, spacing, typography } = useTheme();
  const {
    underline,
    strikethrough,
    bold,
    italic,
    code,
    keyboard,
    superscript,
    subscript,
    placeholder,
    insertMenu,
  } = leaf;

  if (placeholder !== undefined) {
    children = <Placeholder placeholder={placeholder as string}>{children}</Placeholder>;
  }

  if (insertMenu) {
    children = (
      <InsertMenu
        range={(insertMenu as any).range}
        kind={(insertMenu as any).kind}
        search={leaf.text.slice(1)}
      >
        {children}
      </InsertMenu>
    );
  }

  if (code) {
    children = (
      <code
        css={{
          backgroundColor: colors.backgroundDim,
          borderRadius: radii.xsmall,
          display: 'inline-block',
          fontFamily: typography.fontFamily.monospace,
          fontSize: typography.fontSize.small,
          padding: `0 ${spacing.xxsmall}px`,
        }}
      >
        {children}
      </code>
    );
  }
  if (bold) {
    children = <strong>{children}</strong>;
  }
  if (strikethrough) {
    children = <s>{children}</s>;
  }
  if (italic) {
    children = <em>{children}</em>;
  }
  if (keyboard) {
    children = <kbd>{children}</kbd>;
  }
  if (superscript) {
    children = <sup>{children}</sup>;
  }
  if (subscript) {
    children = <sub>{children}</sub>;
  }
  return (
    <span
      {...attributes}
      style={{
        textDecoration: underline ? 'underline' : undefined,
      }}
    >
      {children}
    </span>
  );
};

export const renderLeaf = (props: RenderLeafProps) => {
  return <Leaf {...props} />;
};
