/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRef, Fragment, useLayoutEffect, forwardRef, memo } from 'react';
import { getVisibleSelectionRect } from 'get-selection-range';
import { createPortal } from 'react-dom';
import { Popper } from 'react-popper';
import { marks, markTypes } from './marks';
import { ToolbarButton } from './toolbar-components';
import { CircleSlashIcon } from '@arch-ui/icons';
import { colors } from '@arch-ui/theme';
import { useMeasure } from '@arch-ui/hooks';
import { selectionReference } from './utils';
import { useStateWithEqualityCheck } from './hooks';
import applyRef from 'apply-ref';

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

function InnerToolbar({ blocks, editor, editorState }) {
  return (
    <div css={{ display: 'flex' }}>
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

const PopperRender = forwardRef(({ scheduleUpdate, editorState, style, children }, ref) => {
  let shouldShowToolbar = useHasSelection();
  let containerRef = useRef(null);

  let snapshot = useMeasure(containerRef);

  useLayoutEffect(
    () => {
      if (shouldShowToolbar) {
        scheduleUpdate();
      }
    },
    [scheduleUpdate, editorState, snapshot, shouldShowToolbar]
  );

  return createPortal(
    <div
      onMouseDown={stopPropagation}
      ref={node => {
        applyRef(ref, node);
        applyRef(containerRef, node);
      }}
      style={style}
      css={{
        backgroundColor: colors.N90,
        padding: 8,
        borderRadius: 6,
        display: shouldShowToolbar ? 'flex' : 'none',
        // this isn't as nice of a transition as i'd like since the time is fixed
        // i think it would better if it was physics based but that would probably
        // be a lot of work for little gain
        // maybe base the transition time on the previous value?
        transition: 'transform 100ms, opacity 100ms',
      }}
    >
      {shouldShowToolbar && children}
    </div>,
    document.body
  );
});

export default ({ editorState, blocks, editor }) => {
  // this element is created here so that when the popper rerenders
  // the inner toolbar won't have to update
  let children = <InnerToolbar blocks={blocks} editor={editor} editorState={editorState} />;
  return (
    <Popper placement="top" referenceElement={selectionReference}>
      {({ style, ref, scheduleUpdate }) => (
        <PopperRender {...{ scheduleUpdate, editorState, style, blocks, editor, ref, children }} />
      )}
    </Popper>
  );
};
