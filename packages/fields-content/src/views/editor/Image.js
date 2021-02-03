/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useLayoutEffect, forwardRef } from 'react';
import { usePopper } from 'react-popper';
import { useStateWithEqualityCheck } from './hooks';

const PopperRender = forwardRef(
  ({ update, alignment, isFocused, style, onAlignmentChange }, ref) => {
    useLayoutEffect(() => {
      // The update function is `null` on first render - we want to update this after the below component is mounted to have the correct handler
      if (update) update();
    }, [alignment, update]);

    return (
      <div
        ref={ref}
        css={{
          display: isFocused ? 'block' : 'none',
          backgroundColor: 'black',
          padding: 8,
        }}
        style={style}
      >
        {['left', 'center', 'right'].map(align => {
          return (
            <button
              type="button"
              key={align}
              onMouseDown={event => {
                // so that the image block doesn't get deselected
                event.preventDefault();
              }}
              onClick={() => {
                onAlignmentChange(align);
              }}
            >
              {align}
            </button>
          );
        })}
      </div>
    );
  }
);

const popperModifiers = [
  { name: 'flip', enabled: false },
  { name: 'hide', enabled: false },
  { name: 'preventOverflow', enabled: false },
];

const Image = ({ alignment, attributes, isFocused, src, onAlignmentChange, ...props }) => {
  const [referenceElement, setReferenceElement] = useStateWithEqualityCheck(null);
  const [popperElement, setPopperElement] = useState(null);

  const { styles, update } = usePopper(referenceElement, popperElement, {
    placement: 'top',
    modifiers: popperModifiers,
  });

  return (
    <div>
      <img
        {...props}
        {...attributes}
        src={src}
        ref={setReferenceElement}
        css={{
          width: '100%',
          outline: isFocused ? 'auto' : null,
        }}
      />
      <PopperRender
        {...{
          update,
          alignment,
          ref: setPopperElement,
          isFocused,
          style: styles.popper,
          onAlignmentChange,
        }}
      />
    </div>
  );
};

export default Image;
