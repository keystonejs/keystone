/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment, useLayoutEffect, useMemo, memo } from 'react';
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
import { TransitionProvider, fade } from '@arch-ui/modal-utils';

const InnerToolbar = memo(() => {
  const editor = useSlate();
  const { blocks } = useContentField();

  return (
    <div css={{ display: 'flex' }}>
      {Object.keys(blocks)
        .map(x => blocks[x].withChrome && blocks[x].Toolbar)
        .filter(x => x)
        .reduce(
          (children, Toolbar) => (
            <Toolbar>{children}</Toolbar>
          ),
          <Fragment>
            {markArray.map(([name, { label, icon: Icon }]) => (
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
            ))}

            <ToolbarButton
              label="Remove Formatting"
              icon={<CircleSlashIcon />}
              onClick={() => {
                markTypes.forEach(mark => editor.removeMark(mark));
                ReactEditor.focus(editor);
              }}
            />

            {Object.entries(blocks).map(([type, { withChrome, ToolbarElement }]) =>
              withChrome && ToolbarElement ? <ToolbarElement key={type} /> : null
            )}
          </Fragment>
        )}
    </div>
  );
});

const Toolbar = () => {
  // the reason we do this rather than having the selection reference
  // be constant is because the selection reference
  // has some internal state and it shouldn't persist between different
  // editor references
  const virtualElement = useMemo(getSelectionReference, []);

  const [popperElement, setPopperElement] = useState(null);
  const { styles, forceUpdate } = usePopper(virtualElement, popperElement, {
    placement: 'top',
    modifiers: [{ name: 'computeStyles', options: { adaptive: false } }],
  });

  const editor = useSlate();
  const { selection } = editor;

  // Show the toolbar when text is selected
  // TODO: is it supposed to move with the text?
  const shouldShowToolbar = selection && Editor.string(editor, selection) !== '';

  useLayoutEffect(() => {
    if (shouldShowToolbar && forceUpdate) {
      forceUpdate();
    }
  }, [forceUpdate, shouldShowToolbar]);

  return createPortal(
    <div ref={setPopperElement} style={{ ...styles.popper, zIndex: 10 }}>
      <TransitionProvider isOpen={shouldShowToolbar}>
        {transitionState => (
          <div
            onMouseDown={e => e.stopPropagation()}
            css={{
              backgroundColor: colors.N90,
              padding: '8px',
              borderRadius: '6px',
              margin: gridSize,
              display: 'flex',
              transition: 'transform 100ms, opacity 100ms',
              ...fade(transitionState),
            }}
          >
            <InnerToolbar />
          </div>
        )}
      </TransitionProvider>
    </div>,
    document.body
  );
};

export default Toolbar;
