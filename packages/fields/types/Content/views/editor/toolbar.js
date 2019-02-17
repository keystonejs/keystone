/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRef, Fragment, useLayoutEffect, forwardRef, memo } from 'react';
import { getVisibleSelectionRect } from 'get-selection-range';
import { createPortal } from 'react-dom';
import { Popper } from 'react-popper';
import { marks, markTypes } from './marks';
import { ToolbarButton } from './toolbar-components';
import { CircleSlashIcon } from '@arch-ui/icons';
import { useMeasure } from '@arch-ui/hooks';
import { selectionReference } from './utils';
import { useStateWithEqualityCheck } from './hooks';

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

// why is this component being memoized when editorState will change a lot?
// it's done to stop it from rerendering when the popper updates but the
// internals don't update, it's especially important since
// when the popper updates, the parent element will be animating
// to its new position and doing expensive rerender in that time
// will make the animation janky
let InnerToolbar = memo(function InnerToolbar({ blocks, editor, editorState, scheduleUpdate }) {
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
});

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

export default ({ editorState, blocks, editor }) => {
  return (
    <Popper placement="top" referenceElement={selectionReference}>
      {({ style, ref, scheduleUpdate }) => (
        <PopperRender {...{ scheduleUpdate, editorState, style, blocks, editor, ref }} />
      )}
    </Popper>
  );
};
