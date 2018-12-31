/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useCallback, useRef, Fragment, useLayoutEffect } from 'react';
import { Editor } from 'slate-react';
import { Block } from 'slate';
import { getVisibleSelectionRect } from 'get-selection-range';
import { createPortal } from 'react-dom';
import { useScrollListener, useWindowSize } from './hooks';
import { marks, markTypes, plugins as markPlugins } from './marks';
import { defaultType } from './constants';
import AddBlock from './AddBlock';
import { blockPlugins, blocks, blockTypes } from './blocks';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarCheckbox } from './ToolbarCheckbox';

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

blockTypes.forEach(type => {
  if (blocks[type].schema !== undefined) {
    schema.blocks[type] = blocks[type].schema;
  }
});

let plugins = [...markPlugins, ...blockPlugins];

function Stories({ value: editorState, onChange }) {
  let windowSize = useWindowSize();

  let toolbarContainerRef = useRef(null);
  let editorRef = useRef(null);

  let positionToolbar = useCallback(
    () => {
      let toolbarContainer = toolbarContainerRef.current;
      if (toolbarContainer === null) {
        return;
      }
      const rect = getVisibleSelectionRect();
      if (!rect || rect.width === 0) {
        toolbarContainer.style.display = 'none';
        return;
      }
      toolbarContainer.style.display = 'flex';
      const left = rect.left + rect.width / 2 - toolbarContainer.offsetWidth / 2 + window.scrollX;
      toolbarContainer.style.transform = `translateX(${Math.max(
        Math.min(left, windowSize.innerWidth - toolbarContainer.offsetWidth),
        0
      )}px) translateY(${rect.top - toolbarContainer.offsetHeight + window.scrollY}px)`;
    },
    [toolbarContainerRef, windowSize]
  );

  useLayoutEffect(positionToolbar, [editorState]);
  useScrollListener(positionToolbar);

  return (
    <Fragment>
      <Editor
        schema={schema}
        ref={editorRef}
        plugins={plugins}
        value={editorState}
        onChange={({ value }) => {
          onChange(value);
        }}
        onKeyDown={(event, editor, next) => {
          // make it so when you press enter after typing a heading,
          // the block type will change to a paragraph
          if (
            event.keyCode === 13 &&
            editorState.blocks.every(block => block.type === blocks.heading.type)
          ) {
            editor.splitBlock().setBlocks(defaultType);
            return;
          }
          return next();
        }}
      />
      <AddBlock editorRef={editorRef} editorState={editorState} />
      {createPortal(
        <div
          ref={toolbarContainerRef}
          css={{
            backgroundColor: 'black',
            padding: 8,
            borderRadius: 8,
            width: 'auto',
            position: 'absolute',
            display: 'none',
            left: 0,
            top: 0,
            // this isn't as nice of a transition as i'd like since the time is fixed
            // i think it would better if it was physics based but that would probably
            // be a lot of work for little gain
            // maybe base the transition time on the previous value?
            transition: 'transform 100ms',
          }}
        >
          {blockTypes
            .map(x => blocks[x].Toolbar)
            .filter(x => x)
            .reduce(
              (children, Toolbar) => {
                return (
                  <Toolbar
                    // should do something with a ResizeObserver later
                    reposition={positionToolbar}
                    editor={editorRef.current}
                    editorState={editorState}
                  >
                    {children}
                  </Toolbar>
                );
              },
              <Fragment>
                {Object.keys(marks).map(name => {
                  return (
                    <ToolbarCheckbox
                      isActive={editorState.activeMarks.some(mark => mark.type === name)}
                      onChange={() => {
                        editorRef.current.toggleMark(name);
                      }}
                      key={name}
                      label={marks[name].label}
                      icon={marks[name].icon}
                    />
                  );
                })}
                <ToolbarButton
                  onClick={() => {
                    markTypes.forEach(mark => {
                      editorRef.current.removeMark(mark);
                    });
                  }}
                >
                  Remove Formatting
                </ToolbarButton>

                {blockTypes.map(type => {
                  let ToolbarElement = blocks[type].ToolbarElement;
                  if (ToolbarElement === undefined) {
                    return null;
                  }
                  return (
                    <ToolbarElement
                      key={type}
                      editor={editorRef.current}
                      editorState={editorState}
                    />
                  );
                })}
              </Fragment>
            )}
        </div>,
        document.body
      )}
    </Fragment>
  );
}

export default Stories;
