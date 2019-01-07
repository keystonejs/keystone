/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRef, Fragment, useLayoutEffect, useMemo, useState } from 'react';
import { Editor } from 'slate-react';
import { Block } from 'slate';
import { getVisibleSelectionRect } from 'get-selection-range';
import { createPortal } from 'react-dom';
import { Popper } from 'react-popper';
import { marks, markTypes, plugins as markPlugins } from './marks';
import { type as defaultType } from './block-types/paragraph';
import AddBlock from './AddBlock';
import { ToolbarCheckbox, ToolbarButton } from './toolbar-components';
import { A11yText } from '@voussoir/ui/src/primitives/typography';
import { CircleSlashIcon } from '@voussoir/icons';

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

let selectionElement = {
  getBoundingClientRect: getVisibleSelectionRect,
  get clientWidth() {
    return getVisibleSelectionRect().width;
  },
  get clientHeight() {
    return getVisibleSelectionRect().height;
  },
};

function useHasSelection() {
  let [hasSelection, setHasSelection] = useState(false);
  useLayoutEffect(() => {
    const rect = getVisibleSelectionRect();
    let newValue = rect && rect.width !== 0;
    if (newValue !== hasSelection) {
      setHasSelection(newValue);
    }
  });
  return hasSelection;
}

// to use hooks inside of class components
let Render = ({ children }) => children();

function Stories({ value: editorState, onChange, blocks }) {
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
          renderNode(props, editor) {
            let block = blocks[props.node.type];
            if (block) {
              return block.renderNode(props, editor);
            }
            // we don't want to define how how nodes are rendered in any other place
            throw new Error('Cannot render node of type: ' + props.node.type);
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

  let editorRef = useRef(null);
  let containerRef = useRef(null);
  return (
    <div ref={containerRef}>
      <Editor
        schema={schema}
        ref={editorRef}
        plugins={plugins}
        value={editorState}
        onChange={({ value }) => {
          onChange(value);
        }}
      />
      <AddBlock editor={editorRef.current} editorState={editorState} blocks={blocks} />
      <Popper
        modifiers={{
          preventOverflow: {
            boundariesElement: document.querySelector('main'),
          },
        }}
        placement="top"
        referenceElement={selectionElement}
      >
        {({ style, ref, scheduleUpdate }) => {
          return (
            <Render>
              {() => {
                useLayoutEffect(scheduleUpdate, [editorState]);
                let shouldShowToolbar = useHasSelection();

                return createPortal(
                  <div
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
                    {shouldShowToolbar &&
                      Object.keys(blocks)
                        .map(x => blocks[x].Toolbar)
                        .filter(x => x)
                        .reduce(
                          (children, Toolbar) => {
                            return (
                              <Toolbar
                                // should do something with a ResizeObserver later
                                reposition={scheduleUpdate}
                                editor={editorRef.current}
                                editorState={editorState}
                              >
                                {children}
                              </Toolbar>
                            );
                          },
                          <Fragment>
                            {Object.keys(marks).map(name => {
                              let Icon = marks[name].icon;
                              return (
                                <ToolbarCheckbox
                                  isActive={editorState.activeMarks.some(
                                    mark => mark.type === name
                                  )}
                                  onChange={() => {
                                    editorRef.current.toggleMark(name);
                                  }}
                                  key={name}
                                >
                                  <Icon />
                                  <A11yText>{marks[name].label}</A11yText>
                                </ToolbarCheckbox>
                              );
                            })}
                            <ToolbarButton
                              onClick={() => {
                                markTypes.forEach(mark => {
                                  editorRef.current.removeMark(mark);
                                });
                              }}
                            >
                              <CircleSlashIcon title="Remove Formatting" />
                            </ToolbarButton>

                            {Object.keys(blocks).map(type => {
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
                );
              }}
            </Render>
          );
        }}
      </Popper>
    </div>
  );
}

export default Stories;
