/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useLayoutEffect, forwardRef } from 'react';
import { usePopper } from 'react-popper';
import { colors } from '@arch-ui/theme';

const PopperRender = forwardRef(
  ({ update, alignment, isFocused, style, onAlignmentChange }, ref) => {
    useLayoutEffect(update, [alignment]);
    return (
      <div
        ref={ref}
        css={{
          display: isFocused ? 'block' : 'none',
          padding: '0.2em',
          borderRadius: '0.4em',
          backgroundColor: colors.N90,
        }}
        style={style}
      >
        {['left', 'center', 'right'].map(align => (
          <button
            type="button"
            key={align}
            // so that the image block doesn't get deselected
            onMouseDown={event => event.preventDefault()}
            onClick={() => onAlignmentChange(align)}
            css={{
              padding: '0.2em 0.4em',
              margin: '0.2em',
            }}
          >
            {align}
          </button>
        ))}
      </div>
    );
  }
);

const popperModifiers = [
  { name: 'flip', enabled: false },
  { name: 'hide', enabled: false },
  { name: 'preventOverflow', enabled: false },
];

const Image = ({
  attributes,
  children,
  alignment,
  isFocused,
  src,
  onAlignmentChange,
  ...props
}) => {
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);

  const { styles, update } = usePopper(referenceElement, popperElement, {
    placement: 'top',
    modifiers: popperModifiers,
  });

  return (
    <div {...attributes}>
      <img
        {...props}
        src={src}
        ref={setReferenceElement}
        css={{
          width: '100%',
          outline: isFocused ? 'dashed' : null,
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
