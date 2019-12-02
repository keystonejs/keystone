/** @jsx jsx */
import { forwardRef } from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';

import { LoadingIndicator, LoadingSpinner } from '@arch-ui/loading';
import { Button } from './primitives';

// Styled

const LoadingButtonInner = styled.div({ position: 'relative' });
const LoadingIndicatorWrapper = styled.div({
  left: '50%',
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
});

function getAppearance(appearance) {
  if (appearance === 'default') return 'dark';
  return 'inverted';
}

function LoadingButtonComponent({ children, indicatorVariant, isLoading, ...props }, ref) {
  const appearance = getAppearance(props.appearance || 'default');
  const textCSS = isLoading ? { visibility: 'hidden' } : null;
  const isSpinner = indicatorVariant === 'spinner';

  return (
    <Button ref={ref} variant="bold" {...props}>
      <LoadingButtonInner>
        {isLoading ? (
          <LoadingIndicatorWrapper>
            {isSpinner ? (
              <LoadingSpinner appearance={appearance} size={16} />
            ) : (
              <LoadingIndicator appearance={appearance} size={4} />
            )}
          </LoadingIndicatorWrapper>
        ) : null}
        <span css={textCSS}>{children}</span>
      </LoadingButtonInner>
    </Button>
  );
}

// Export
export const LoadingButton = forwardRef(LoadingButtonComponent);
