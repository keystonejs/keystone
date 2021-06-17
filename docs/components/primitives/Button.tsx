/** @jsx jsx */
import { jsx } from '@emotion/react';
import { forwardRef } from 'react';

import { Loading } from './Loading';

export const Button = forwardRef(
  ({ look = 'default', disabled, loading, children, ...props }, ref) => {
    const styleMap = {
      default: {},
      danger: {
        '--button-bg': 'var(--danger)',
        '--button-bg-hover': 'var(--danger-90)',
        '--button-bg-active': 'var(--danger-90)',
        '--button-bg-disabled': 'var(--danger--40)',
      },
      text: {
        '--button-bg': 'transparent',
        '--button-bg-hover': 'transparent',
        '--button-bg-active': 'transparent',
        '--button-color': 'var(--brand)',
        '--button-color-disabled': 'var(--disabled)',
        '--button-decoration-hover': 'underline',
        '--button-shadow': 'none',
        '--button-shadow-hover': 'none',
        '--button-shadow-active': 'none',
        '--button-bg-disabled': 'transparent',
        '--button-transform-active': 'none',
        display: 'inline',
        height: 'auto',
        padding: 0,
        borderRadius: 0,
      },
    };

    if (look === 'text') {
      disabled = loading ? true : disabled;
      loading = false;
    }

    return (
      <button
        ref={ref}
        css={{
          '--button-bg': 'var(--brand-bg)',
          '--button-bg-hover': 'var(--brand-bg-90)',
          '--button-bg-active': 'var(--brand-bg-90)',
          '--button-bg-disabled': 'var(--brand-bg--40)',
          '--button-color': '#fff',
          '--button-color-disabled': '#fff',
          '--button-decoration-hover': 'none',
          '--button-shadow': 'rgba(0, 0, 0, 0.2) 0 1px 2px',
          '--button-shadow-hover': 'rgba(0, 0, 0, 0.4) 0 1px 2px',
          '--button-shadow-active': 'rgba(0, 0, 0, 0.2) 0 1px 2px',
          '--button-transform-active': 'translateY(1px)',
          position: 'relative',
          display: 'inline-flex',
          flexShrink: '0',
          fontSize: 'var(--font2)',
          color: 'var(--button-color)',
          mozBoxAlign: 'center',
          alignItems: 'center',
          boxShadow: 'var(--button-shadow)',
          background: 'var(--button-bg)',
          border: '0 none',
          borderRadius: '8px',
          fontWeight: '600',
          height: '2.5rem',
          mozBoxPack: 'center',
          justifyContent: 'center',
          outline: 'currentcolor none 0',
          padding: '0 var(--space-large)',
          textDecoration: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          transition: 'all 0.1s ease',
          ':hover': {
            boxShadow: 'var(--button-shadow-hover)',
            background: 'var(--button-bg-hover)',
            textDecoration: 'var(--button-decoration-hover)',
          },
          ':active': {
            boxShadow: 'var(--button-shadow-active)',
            transform: 'var(--button-transform-active)',
            background: 'var(--button-bg-active)',
          },
          ':disabled': {
            boxShadow: 'none',
            cursor: 'not-allowed',
            background: 'var(--button-bg-disabled)',
            opacity: '0.9',
            color: 'var(--button-color-disabled)',
            pointerEvents: 'none',
          },
          ...styleMap[look],
        }}
        aria-disabled={disabled ? true : undefined}
        disabled={loading || disabled}
        {...props}
      >
        <span
          css={{
            opacity: loading ? 0 : 1,
          }}
        >
          {children}
        </span>
        {loading ? (
          <Loading
            css={{
              position: 'absolute',
            }}
          />
        ) : null}
      </button>
    );
  }
);

Button.displayName = 'Button';
