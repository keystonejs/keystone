/** @jsx jsx */
import { jsx } from '@emotion/react';
import { forwardRef } from 'react';

export const Field = forwardRef(({ disabled, type = 'text', ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      css={{
        appearance: 'none',
        backgroundColor: 'var(--app-bg)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
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
        transition: 'all 0.1s ease',
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
});

Field.displayName = 'Field';
