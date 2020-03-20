/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useLayoutEffect, forwardRef } from 'react';
import { Popper } from 'react-popper';
import { useStateWithEqualityCheck } from './hooks';
import { colors } from '@arch-ui/theme';

const PopperRender = forwardRef(
  ({ scheduleUpdate, alignment, isFocused, style, onAlignmentChange }, ref) => {
    useLayoutEffect(scheduleUpdate, [alignment]);
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

const popperModifiers = {
  flip: { enabled: false },
  hide: { enabled: false },
  preventOverflow: { enabled: false },
};

const Image = ({
  attributes,
  children,
  alignment,
  isFocused,
  src,
  onAlignmentChange,
  ...props
}) => {
  const [referenceElement, setReferenceElement] = useStateWithEqualityCheck(null);

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
