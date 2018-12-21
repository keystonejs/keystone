/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useCallback, useRef, Fragment, useLayoutEffect } from 'react';
import { getVisibleSelectionRect } from 'get-selection-range';
import { useScrollListener, useWindowSize } from './hooks';
import { defaultType } from './constants';
import { blocks, blockTypes } from './blocks';

let AddBlock = ({ editorState, editorRef }) => {
  let windowSize = useWindowSize();

  let containerRef = useRef(null);
  let otherContainerRef = useRef(null);
  let focusBlock = editorState.focusBlock;
  let layout = useCallback(
    () => {
      let container = containerRef.current;
      let otherContainer = otherContainerRef.current;
      const rect = getVisibleSelectionRect();
      if (
        !rect ||
        rect.width !== 0 ||
        focusBlock === null ||
        focusBlock.text !== '' ||
        focusBlock.type !== defaultType
      ) {
        setIsOpen(false);
        container.style.top = '';
        container.style.left = '';
        otherContainer.style.top = '';
        otherContainer.style.left = '';

        return;
      }
      const top = rect.top + window.scrollY - container.offsetHeight / 2 + rect.height / 2; // eslint-disable-line
      const left = rect.left + window.scrollX - container.offsetWidth;
      container.style.top = `${top}px`;
      container.style.left = `${left}px`;
      otherContainer.style.top = `${top}px`;
      otherContainer.style.left = `${left + container.offsetWidth}px`;
    },
    [focusBlock, windowSize]
  );

  useLayoutEffect(layout);
  useScrollListener(layout);
  let [isOpen, setIsOpen] = useState(false);

  return (
    <Fragment>
      <div ref={containerRef} css={{ position: 'absolute', top: -10000, left: -10000 }}>
        <button
          type="button"
          onClick={() => {
            setIsOpen(x => !x);
          }}
        >
          {isOpen ? 'Close' : 'Open'}
        </button>
      </div>
      <div css={{ position: 'absolute', top: -10000, left: -10000 }} ref={otherContainerRef}>
        {isOpen && (
          <div>
            {blockTypes.map(key => {
              let { Sidebar } = blocks[key];
              if (Sidebar === undefined) {
                return null;
              }
              return <Sidebar key={key} editorRef={editorRef} />;
            })}
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default AddBlock;
