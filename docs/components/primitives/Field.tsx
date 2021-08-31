/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import { forwardRef, InputHTMLAttributes } from 'react';

type Ref = HTMLInputElement;

export const Field = forwardRef<Ref, InputHTMLAttributes<HTMLInputElement>>(
  ({ disabled, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        css={{
          appearance: 'none',
          backgroundColor: 'var(--app-bg)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          color: 'var(--text)',
          fontSize: '1rem',
          fontWeight: 400,
          outline: 0,
          paddingLeft: '1rem',
          paddingRight: '1rem',
          textAlign: 'inherit',
          width: '100%',
          height: '2.5rem',
          lineHeight: 1,
          paddingBottom: 0,
          paddingTop: 0,
          boxShadow: '0 0 0 2px transparent',
          transition: 'border 0.1s ease, box-shadow 0.1s ease',
          ':hover': {
            borderColor: 'var(--brand-bg)',
          },
          ':focus': {
            borderColor: 'var(--focus)',
            boxShadow: '0 0 0 2px var(--focus)',
          },
          ':disabled': {
            cursor: 'not-allowed',
            background: 'var(--border)',
            color: 'var(--code)',
            pointerEvents: 'none',
          },
        }}
        aria-disabled={disabled ? true : undefined}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Field.displayName = 'Field';
