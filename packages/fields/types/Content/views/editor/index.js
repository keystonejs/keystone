/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRef, Fragment, useLayoutEffect, useMemo, useState } from 'react';
import { Editor } from 'slate-react';
import { Block } from 'slate';
import { getVisibleSelectionRect } from 'get-selection-range';
import { createPortal } from 'react-dom';
import { Popper } from 'react-popper';
import { marks, markTypes, plugins as markPlugins } from './marks';
import { type as defaultType } from './blocks/paragraph';
import AddBlock from './AddBlock';
import { ToolbarButton } from './toolbar-components';
import { A11yText } from '@voussoir/ui/src/primitives/typography';
import { CircleSlashIcon } from '@voussoir/icons';
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

let stopPropagation = e => {
  // if (e.nativeEvent.target.tagName !== 'INPUT') {
  // e.preventDefault();
  // }
  e.stopPropagation();
};

export function useContainerQuery(ref) {
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);

  // bail early without ref
  if (!ref) {
    throw new Error('You must pass a valid ref as the first argument.');
  }

  // Updates scheduled inside useLayoutEffect will be flushed synchronously,
  // before the browser has a chance to paint.
  useLayoutEffect(() => {
    // prepare the resize handler
    let resizeObserver = new ResizeObserver(([entry]) => {
      setHeight(entry.target.offsetHeight);
      setWidth(entry.target.offsetWidth);
    });

    // bind the observer to the consumer DOM node
    resizeObserver.observe(ref.current);

    // cleanup after ourselves
    return () => {
      resizeObserver.disconnect(ref.current);
    };
  });

  return { height, width };
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
          renderNode(props) {
            let block = blocks[props.node.type];
            if (block) {
              return <block.Node {...props} />;
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
                          previousHeight = Math.round(entry.contentRect.height);
                          previousWidth = Math.round(entry.contentRect.width);
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
                                <Toolbar editor={editorRef.current} editorState={editorState}>
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
                                      editorRef.current.toggleMark(name);
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
