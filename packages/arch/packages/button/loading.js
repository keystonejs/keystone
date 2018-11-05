// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';

import { LoadingIndicator, LoadingSpinner } from '../loading';
import { Button, type ButtonProps } from './primitives';

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

// Export

type Loading = ButtonProps & {
  isLoading: boolean,
  indicatorVariant: 'spinner' | 'dots',
};
export const LoadingButton = ({ children, indicatorVariant, isLoading, ...props }: Loading) => {
  const appearance = getAppearance(props.appearance);
  const textCSS = isLoading ? { visibility: 'hidden' } : null;
  const isSpinner = indicatorVariant === 'spinner';

  return (
    <Button {...props}>
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
};
LoadingButton.defaultProps = {
  appearance: 'default',
  isLoading: false,
  variant: 'bold',
  indicatorVariant: 'dots',
};
