/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useRef, Fragment, useLayoutEffect, forwardRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';

import { Editor } from 'slate';
import { useSlate, ReactEditor } from 'slate-react';

import { useContentField } from './context';
import { markArray, markTypes } from './marks';
import { ToolbarButton } from './toolbar-components';
import { isMarkActive, getSelectionReference, toggleMark } from './utils';

import { CircleSlashIcon } from '@arch-ui/icons';
import { colors, gridSize } from '@arch-ui/theme';
import { useMeasure } from '@arch-ui/hooks';

import applyRef from 'apply-ref';

const InnerToolbar = () => {
  const editor = useSlate();
  const { blocks } = useContentField();

  return (
    <div css={{ display: 'flex' }}>
      {Object.keys(blocks)
        .map(x => blocks[x].withChrome && blocks[x].Toolbar)
        .filter(x => x)
        .reduce(
          (children, Toolbar) => {
            return <Toolbar>{children}</Toolbar>;
          },
          <Fragment>
            {markArray.map(([name, { label, icon: Icon }]) => {
              return (
                <ToolbarButton
                  key={name}
                  label={label}
                  icon={<Icon />}
                  isActive={isMarkActive(editor, name)}
                  onClick={() => {
                    toggleMark(editor, name);
                    ReactEditor.focus(editor);
                  }}
                />
              );
            })}

            <ToolbarButton
              label="Remove Formatting"
              icon={<CircleSlashIcon />}
              onClick={() => {
                markTypes.forEach(mark => editor.removeMark(mark));
                ReactEditor.focus(editor);
              }}
            />

            {Object.entries(blocks).map(([type, { withChrome, ToolbarElement }]) => {
              if (withChrome && ToolbarElement) {
                return <ToolbarElement key={type} />;
              }

              return null;
            })}
          </Fragment>
        )}
    </div>
  );
};

const PopperRender = forwardRef(({ update, style, children }, ref) => {
  const editor = useSlate();
  const { selection } = editor;

  const shouldShowToolbar = selection && Editor.string(editor, selection) !== '';
  const containerRef = useRef(null);

  const snapshot = useMeasure(containerRef);

  useLayoutEffect(() => {
    if (shouldShowToolbar) {
      update();
    }
  }, [update, snapshot, shouldShowToolbar]);

  return createPortal(
    <div
      onMouseDown={e => e.stopPropagation()}
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
          padding: '8px',
          borderRadius: '6px',
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

const Toolbar = () => {
  // This element is created here so that when the popper rerenders
  // the inner toolbar won't have to update
  const children = <InnerToolbar />;

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
        style: { ...styles.popper, zIndex: 10 },
        ref: setPopperElement,
        children,
      }}
    />
  );
};

export default Toolbar;
