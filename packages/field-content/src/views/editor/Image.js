/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import { Button } from '@arch-ui/button';
import { colors } from '@arch-ui/theme';

const popperModifiers = [
  { name: 'flip', enabled: false },
  { name: 'hide', enabled: false },
  { name: 'preventOverflow', enabled: false },
  { name: 'offset', options: { offset: [0, 16] } },
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

  const { styles, forceUpdate } = usePopper(referenceElement, popperElement, {
    placement: 'top',
    modifiers: popperModifiers,
  });

  useLayoutEffect(() => {
    if (forceUpdate) forceUpdate();
  }, [forceUpdate, alignment]);

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
      {children}
      {createPortal(
        <div
          ref={setPopperElement}
          css={{
            display: isFocused ? 'block' : 'none',
            padding: '0.2em',
            borderRadius: '0.4em',
            backgroundColor: colors.N90,
          }}
          style={styles.popper}
        >
          {['left', 'center', 'right'].map(align => (
            <button
              variant="subtle"
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default Image;
