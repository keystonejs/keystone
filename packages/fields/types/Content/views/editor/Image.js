/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useLayoutEffect, forwardRef } from 'react';
import { Popper } from 'react-popper';
import { useStateWithEqualityCheck } from './hooks';

let PopperRender = forwardRef(
  ({ scheduleUpdate, alignment, isFocused, style, onAlignmentChange }, ref) => {
    useLayoutEffect(scheduleUpdate, [alignment]);
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

let popperModifiers = {
  flip: { enabled: false },
  hide: { enabled: false },
  preventOverflow: { enabled: false },
};

let Image = ({ alignment, attributes, isFocused, src, onAlignmentChange, ...props }) => {
  let [referenceElement, setReferenceElement] = useStateWithEqualityCheck(null);

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
      <Popper modifiers={popperModifiers} placement="top" referenceElement={referenceElement}>
        {({ style, ref, scheduleUpdate }) => (
          <PopperRender
            {...{ scheduleUpdate, alignment, ref, isFocused, style, onAlignmentChange }}
          />
        )}
      </Popper>
    </div>
  );
};

export default Image;
