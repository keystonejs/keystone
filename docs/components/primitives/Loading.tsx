/** @jsx jsx */
import { jsx, keyframes } from '@emotion/react';
import { HTMLAttributes } from 'react';

const loading = keyframes({
  '0%, 80%, 100%': {
    opacity: 0,
  },
  '40%': {
    opacity: 1,
  },
});

const commonStyles = {
  display: 'block',
  backgroundColor: 'currentcolor',
  height: '1em',
  width: '1em',
  borderRadius: '50%',
  animation: `${loading} 1s linear infinite`,
};

type LoadingProps = HTMLAttributes<HTMLElement>;

export function Loading(props: LoadingProps) {
  return (
    <div
      aria-live="polite"
      aria-label="Loading"
      css={{
        display: 'inline-grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '0.3em',
        fontSize: '8px',
      }}
      {...props}
    >
      <div
        css={{
          ...commonStyles,
          animationDelay: '0ms',
        }}
      />
      <div
        css={{
          ...commonStyles,
          animationDelay: '160ms',
        }}
      />
      <div
        css={{
          ...commonStyles,
          animationDelay: '320ms',
        }}
      />
    </div>
  );
}
