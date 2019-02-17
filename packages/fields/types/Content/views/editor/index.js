/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRef, Fragment, useLayoutEffect, useMemo, forwardRef } from 'react';
import { Editor } from 'slate-react';
import { Block } from 'slate';
import { getVisibleSelectionRect } from 'get-selection-range';
import { createPortal } from 'react-dom';
import { Popper } from 'react-popper';
import { marks, markTypes, plugins as markPlugins } from './marks';
import { type as defaultType } from './blocks/paragraph';
import AddBlock from './AddBlock';
import { ToolbarButton } from './toolbar-components';
import { CircleSlashIcon } from '@arch-ui/icons';
import { useMeasure } from '@arch-ui/hooks';
import { selectionReference } from './utils';
import { useStateWithEqualityCheck } from './hooks';

function getSchema(blocks) {
  const schema = {
    document: {
      last: { type: defaultType },
      normalize: (editor, { code, node }) => {
        switch (code) {
          case 'last_child_type_invalid': {
            const paragraph = Block.create(defaultType);
            return editor.insertNodeByKey(node.key, node.nodes.size, paragraph);
          }
        }
      },
    },
    blocks: {},
  };
  Object.keys(blocks).forEach(type => {
    if (blocks[type].schema !== undefined) {
      schema.blocks[type] = blocks[type].schema;
    }
  });
  return schema;
}

function useHasSelection() {
  let [hasSelection, setHasSelection] = useStateWithEqualityCheck(false);
  useLayoutEffect(() => {
    const rect = getVisibleSelectionRect();
    let newValue = rect && rect.width !== 0;
    setHasSelection(newValue);
  });
  return hasSelection;
}

let stopPropagation = e => {
  e.stopPropagation();
};

function InnerToolbar({ blocks, editor, editorState, scheduleUpdate }) {
  let ref = useRef(null);
  let snapshot = useMeasure(ref);
  useLayoutEffect(scheduleUpdate, [snapshot]);

  return (
    <div css={{ display: 'flex' }} ref={ref}>
      {Object.keys(blocks)
        .map(x => blocks[x].Toolbar)
        .filter(x => x)
        .reduce(
          (children, Toolbar) => {
            return (
              <Toolbar editor={editor} editorState={editorState}>
                {children}
              </Toolbar>
            );
          },
          <Fragment>
            {Object.keys(marks).map(name => {
              let Icon = marks[name].icon;
              return (
                <ToolbarButton
                  label={marks[name].label}
                  icon={<Icon />}
                  isActive={editorState.activeMarks.some(mark => mark.type === name)}
                  onClick={() => {
                    editor.toggleMark(name);
                  }}
                  key={name}
                />
              );
            })}
            <ToolbarButton
              label="Remove Formatting"
              icon={<CircleSlashIcon />}
              onClick={() => {
                markTypes.forEach(mark => {
                  editor.removeMark(mark);
                });
              }}
            />

            {Object.keys(blocks).map(type => {
              let ToolbarElement = blocks[type].ToolbarElement;
              if (ToolbarElement === undefined) {
                return null;
              }
              return <ToolbarElement key={type} editor={editor} editorState={editorState} />;
            })}
          </Fragment>
        )}
    </div>
  );
}

const PopperRender = forwardRef(({ scheduleUpdate, editorState, style, blocks, editor }, ref) => {
  useLayoutEffect(scheduleUpdate, [editorState]);

  let shouldShowToolbar = useHasSelection();

  return createPortal(
    <div
      onMouseDown={stopPropagation}
      ref={ref}
      style={style}
      css={{
        backgroundColor: 'black',
        padding: 8,
        borderRadius: 6,
        width: 'auto',
        position: 'absolute',
        display: shouldShowToolbar ? 'flex' : 'none',
        left: 0,
        top: 0,
        // this isn't as nice of a transition as i'd like since the time is fixed
        // i think it would better if it was physics based but that would probably
        // be a lot of work for little gain
        // maybe base the transition time on the previous value?
        transition: 'transform 100ms',
      }}
    >
      {shouldShowToolbar && (
        <InnerToolbar
          blocks={blocks}
          editor={editor}
          editorState={editorState}
          scheduleUpdate={scheduleUpdate}
        />
      )}
    </div>,
    document.body
  );
});

function Stories({ value: editorState, onChange, blocks, className }) {
  let schema = useMemo(
    () => {
      return getSchema(blocks);
    },
    [blocks]
  );

  let plugins = useMemo(
    () => {
      let combinedPlugins = [
        ...markPlugins,
        {
          renderNode(props) {
            let block = blocks[props.node.type];
            if (block) {
              return <block.Node {...props} />;
            }
            return null;
          },
        },
      ];

      Object.keys(blocks).forEach(type => {
        let blockTypePlugins = blocks[type].plugins;
        if (blockTypePlugins !== undefined) {
          combinedPlugins.push(...blockTypePlugins);
        }
      });
      return combinedPlugins;
    },
    [blocks]
  );

  let [editor, setEditor] = useStateWithEqualityCheck(null);
  let containerRef = useRef(null);
  return (
    <div ref={containerRef} className={className}>
      <Editor
        schema={schema}
        ref={setEditor}
        plugins={plugins}
        value={editorState}
        onChange={({ value }) => {
          onChange(value);
        }}
      />
      <AddBlock editor={editor} editorState={editorState} blocks={blocks} />
      <Popper placement="top" referenceElement={selectionReference}>
        {({ style, ref, scheduleUpdate }) => (
          <PopperRender {...{ scheduleUpdate, editorState, style, blocks, editor, ref }} />
        )}
      </Popper>
    </div>
  );
}

export default Stories;
