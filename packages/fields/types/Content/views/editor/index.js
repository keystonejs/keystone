/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRef, Fragment, useLayoutEffect, useMemo } from 'react';
import { Editor } from 'slate-react';
import { Block } from 'slate';
import { getVisibleSelectionRect } from 'get-selection-range';
import { createPortal } from 'react-dom';
import { Popper } from 'react-popper';
import { marks, markTypes, plugins as markPlugins } from './marks';
import { type as defaultType } from './blocks/paragraph';
import AddBlock from './AddBlock';
import { ToolbarButton } from './toolbar-components';
import { A11yText } from '@arch-ui/typography';
import { CircleSlashIcon } from '@arch-ui/icons';
import ResizeObserver from 'resize-observer-polyfill';
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
    <div ref={containerRef}>
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
        {({ style, ref, scheduleUpdate }) => {
          return (
            <Render>
              {() => {
                useLayoutEffect(scheduleUpdate, [editorState]);

                let shouldShowToolbar = useHasSelection();

                let [toolbarElement, setToolbarElement] = useStateWithEqualityCheck(null);

                let observerRef = useRef(null);

                useLayoutEffect(
                  () => {
                    if (toolbarElement !== null) {
                      let rect = toolbarElement.getBoundingClientRect();
                      let previousHeight = Math.round(rect.height);
                      let previousWidth = Math.round(rect.width);
                      observerRef.current = new ResizeObserver(entries => {
                        let entry = entries[0];
                        let { height, width } = entry.contentRect;
                        height = Math.round(height);
                        width = Math.round(width);
                        if (
                          (height !== previousHeight || width !== previousWidth) &&
                          height !== 0 &&
                          width !== 0
                        ) {
                          previousHeight = height;
                          previousWidth = width;
                          scheduleUpdate();
                        }
                      });
                    }
                  },
                  [scheduleUpdate, toolbarElement]
                );

                useLayoutEffect(
                  () => {
                    if (shouldShowToolbar && toolbarElement !== null) {
                      let observer = observerRef.current;
                      observer.observe(toolbarElement);
                      return () => {
                        observer.unobserve(toolbarElement);
                      };
                    }
                  },
                  [shouldShowToolbar, toolbarElement, scheduleUpdate]
                );

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
                      <div css={{ display: 'flex' }} ref={setToolbarElement}>
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
                                    isActive={editorState.activeMarks.some(
                                      mark => mark.type === name
                                    )}
                                    onClick={() => {
                                      editor.toggleMark(name);
                                    }}
                                    key={name}
                                  >
                                    <Icon />
                                    <A11yText>{marks[name].label}</A11yText>
                                  </ToolbarButton>
                                );
                              })}
                              <ToolbarButton
                                onClick={() => {
                                  markTypes.forEach(mark => {
                                    editor.removeMark(mark);
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
                                    editor={editor}
                                    editorState={editorState}
                                  />
                                );
                              })}
                            </Fragment>
                          )}
                      </div>
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
