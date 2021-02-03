/** @jsx jsx */

import { ElementType, ReactNode, createContext, useContext } from 'react';
import { jsx, forwardRefWithAs, useTheme } from '@keystone-ui/core';

// todo - these also exist at ../../types
export type SizeType = 'small' | 'medium';
export type ShapeType = 'square' | 'round';

/**
 * What is this thing?
 * ------------------------------
 * We expose primitive components for adorning inputs with icons and buttons.
 * There's some awkard requirements surrounding size and shape that's best to
 * consolidate in one place.
 */

const AdornmentContext = createContext<{ shape: ShapeType; size: SizeType }>({
  shape: 'square',
  size: 'medium',
});
const useAdornmentContext = () => useContext(AdornmentContext);

// Adornment Wrapper
// ------------------------------

export type AdornmentWrapperProps = {
  children: ReactNode;
  shape: ShapeType;
  size: SizeType;
};

export const AdornmentWrapper = ({ children, shape, size }: AdornmentWrapperProps) => {
  return (
    <AdornmentContext.Provider value={{ shape, size }}>
      <div
        css={{
          alignItems: 'center',
          display: 'flex',
          position: 'relative',
          width: '100%',
        }}
      >
        {children}
      </div>
    </AdornmentContext.Provider>
  );
};

// Adornment Element
// ------------------------------

const alignmentPaddingMap = {
  left: 'marginLeft',
  right: 'marginRight',
};

type AdornmentProps = {
  align: 'left' | 'right';
  as?: ElementType;
};
export const Adornment = forwardRefWithAs<'div', AdornmentProps>(
  ({ align, as: Tag = 'div', ...props }, ref) => {
    const { shape, size } = useAdornmentContext();
    const { controlSizes } = useTheme();

    const { indicatorBoxSize, paddingX } = controlSizes[size];

    // optical alignment shifts towards the middle of the container with the large
    // border radius on "round" inputs. use padding rather than margin to optimise
    // the hit-area of interactive elements
    const offsetStyles =
      shape === 'round'
        ? {
            [alignmentPaddingMap[align]]: paddingX / 4,
          }
        : null;

    return (
      <Tag
        ref={ref}
        css={{
          [align]: 0,
          alignItems: 'center',
          display: 'flex',
          height: indicatorBoxSize,
          justifyContent: 'center',
          position: 'absolute',
          top: 0,
          width: indicatorBoxSize,
          ...offsetStyles,
        }}
        {...props}
      />
    );
  }
);
