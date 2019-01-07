/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useLayoutEffect } from 'react';
import { Popper } from 'react-popper';
import { useStateWithEqualityCheck } from './hooks';

let Render = ({ children }) => children();

let Image = ({ alignment, attributes, isFocused, src, onAlignmentChange }) => {
  let [referenceElement, setReferenceElement] = useStateWithEqualityCheck(null);

  return (
    <div>
      <img
        {...attributes}
        data-focused={isFocused}
        selected={isFocused}
        src={src}
        ref={setReferenceElement}
        css={{
          ...getImageStyle(alignment),
          outline: isFocused ? 'auto' : null,
        }}
      />
      <Popper referenceElement={referenceElement}>
        {({ style, ref, scheduleUpdate }) => {
          return (
            <Render>
              {() => {
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
              }}
            </Render>
          );
        }}
      </Popper>
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
