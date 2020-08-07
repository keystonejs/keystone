/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useRef, Fragment, useLayoutEffect, forwardRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import { marks, markTypes } from './marks';
import { ToolbarButton } from './toolbar-components';
import { CircleSlashIcon } from '@primer/octicons-react';
import { colors, gridSize } from '@arch-ui/theme';
import { useMeasure } from '@arch-ui/hooks';
import { getSelectionReference } from './utils';
import applyRef from 'apply-ref';

let stopPropagation = e => {
  e.stopPropagation();
};

function InnerToolbar({ blocks, editor, editorState }) {
  return (
    <div css={{ display: 'flex' }}>
      {Object.keys(blocks)
        .map(x => blocks[x].withChrome && blocks[x].Toolbar)
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
                    editor.focus();
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
                editor.focus();
              }}
            />

            {Object.keys(blocks).map(type => {
              let ToolbarElement = blocks[type].ToolbarElement;
              if (!blocks[type].withChrome || ToolbarElement === undefined) {
                return null;
              }
              return <ToolbarElement key={type} editor={editor} editorState={editorState} />;
            })}
          </Fragment>
        )}
    </div>
  );
}

const PopperRender = forwardRef(({ update, editorState, style, children }, ref) => {
  let { fragment } = editorState;
  let shouldShowToolbar = fragment.text !== '';
  let containerRef = useRef(null);

  let snapshot = useMeasure(containerRef);

  useLayoutEffect(() => {
    if (shouldShowToolbar) {
      update();
    }
  }, [update, editorState, snapshot, shouldShowToolbar]);

  return createPortal(
    <div
      onMouseDown={stopPropagation}
      ref={node => {
        applyRef(ref, node);
        applyRef(containerRef, node);
      }}
      style={style}
      css={{
        // this isn't as nice of a transition as i'd like since the time is fixed
        // i think it would better if it was physics based but that would probably
        // be a lot of work for little gain
        // maybe base the transition time on the previous value?
        transition: 'transform 100ms, opacity 100ms',
      }}
    >
      <div
        css={{
          backgroundColor: colors.N90,
          padding: 8,
          borderRadius: 6,
          margin: gridSize,
          display: shouldShowToolbar ? 'flex' : 'none',
        }}
      >
        {shouldShowToolbar && children}
      </div>
    </div>,
    document.body
  );
});

export default ({ editorState, blocks, editor }) => {
  // this element is created here so that when the popper rerenders
  // the inner toolbar won't have to update
  const children = <InnerToolbar blocks={blocks} editor={editor} editorState={editorState} />;

  // the reason we do this rather than having the selection reference
  // be constant is because the selection reference
  // has some internal state and it shouldn't persist between different
  // editor references
  const virtualElement = useMemo(getSelectionReference, []);

  const [popperElement, setPopperElement] = useState(null);
  const { styles, update } = usePopper(virtualElement, popperElement, {
    placement: 'top',
    modifiers: [{ name: 'computeStyles', options: { adaptive: false } }],
  });

  return (
    <PopperRender
      {...{
        update,
        editorState,
        style: { ...styles.popper, zIndex: 10 },
        blocks,
        editor,
        ref: setPopperElement,
        children,
      }}
    />
  );
};
