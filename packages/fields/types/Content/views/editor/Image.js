/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRef } from 'react';
import { usePopper } from './hooks';

let Image = ({ alignment, attributes, isFocused, src, onAlignmentChange }) => {
  let popperRef = useRef(null);
  let referenceRef = useRef(null);
  let [style] = usePopper(popperRef, referenceRef, { placement: 'top' }, [alignment]);

  return (
    <div>
      <img
        {...attributes}
        data-focused={isFocused}
        selected={isFocused}
        src={src}
        ref={referenceRef}
        css={{
          ...getImageStyle(alignment),
          outline: isFocused ? 'auto' : null,
        }}
      />

      {isFocused && (
        <div
          ref={popperRef}
          css={{
            backgroundColor: 'black',
            padding: 8,
            transition: 'transform 100ms',
            // not sure why this is necessary
            width: 140,
            height: 36,
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
      )}
    </div>
  );
};

function getImageStyle(alignment) {
  if (alignment === 'left') {
    return {
      float: 'left',
      marginRight: '10px',
      width: '50%',
    };
  } else if (alignment === 'right') {
    return {
      float: 'right',
      marginLeft: '10px',
      width: '50%',
    };
  } else {
    return {
      display: 'block',
      margin: '0px auto',
      width: '100%',
    };
  }
}

export default Image;
