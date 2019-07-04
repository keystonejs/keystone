/** @jsx jsx */
import { jsx } from '@emotion/core';
import { createPortal } from 'react-dom';
import { useState, useCallback, useRef, Fragment, useLayoutEffect } from 'react';
import { getVisibleSelectionRect } from 'get-selection-range';
import { useScrollListener, useWindowSize } from './hooks';
import { type as defaultType } from './blocks/paragraph';
import { PlusIcon } from '@arch-ui/icons';

let AddBlock = ({ editorState, editor, blocks }) => {
  let windowSize = useWindowSize();

  let openCloseRef = useRef(null);
  let containerRef = useRef(null);
  let focusBlock = editorState.focusBlock;
  let layout = useCallback(() => {
    let openCloseEle = openCloseRef.current;
    let containerEle = containerRef.current;
    const rect = getVisibleSelectionRect();

    if (
      !rect ||
      rect.width !== 0 ||
      focusBlock === null ||
      focusBlock.text !== '' ||
      focusBlock.type !== defaultType
    ) {
      setIsOpen(false);
      openCloseEle.style.top = '';
      openCloseEle.style.left = '';
      containerEle.style.top = '';
      containerEle.style.left = '';

      return;
    }
    const top = rect.top + window.scrollY - openCloseEle.offsetHeight / 2 + rect.height / 2; // eslint-disable-line
    openCloseEle.style.top = `${top}px`;
    containerEle.style.top = `${top}px`;
    const containerEleLeft = rect.left + window.scrollX;
    containerEle.style.left = `${containerEleLeft}px`;

    const left = containerEleLeft - openCloseEle.offsetWidth;
    openCloseEle.style.left = `${left}px`;
  }, [focusBlock, windowSize]);

  useLayoutEffect(layout);
  useScrollListener(layout);
  let [isOpen, setIsOpen] = useState(false);

  return createPortal(
    <Fragment>
      <div ref={openCloseRef} css={{ position: 'absolute', top: -10000, left: -10000 }}>
        <button
          type="button"
          css={{
            borderRadius: '100%',
            border: '1px black solid',
            width: 30,
            height: 30,
            marginRight: 4,
          }}
          onClick={() => {
            setIsOpen(x => !x);
          }}
        >
          <PlusIcon
            css={{
              transition: '50ms transform',
              transform: isOpen ? 'rotateZ(45deg)' : 'rotateZ(0deg)',
            }}
            title={isOpen ? 'Close' : 'Open'}
          />
        </button>
      </div>
      <div css={{ position: 'absolute', top: -10000, left: -10000 }} ref={containerRef}>
        {isOpen && (
          <div>
            {Object.keys(blocks).map(key => {
              let { Sidebar } = blocks[key];
              if (!blocks[key].withChrome || Sidebar === undefined) {
                return null;
              }
              return <Sidebar key={key} editor={editor} blocks={blocks} />;
            })}
          </div>
        )}
      </div>
    </Fragment>,
    document.body
  );
};

export default AddBlock;
