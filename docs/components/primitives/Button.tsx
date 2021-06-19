/** @jsx jsx */
import { Fragment, FunctionComponent, ReactNode } from 'react';
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { forwardRefWithAs } from '../../lib/forwardRefWithAs';
import { Loading } from './Loading';

const styleMap = {
  default: {},
  danger: {
    '--button-bg': 'var(--danger)',
    '--button-bg-hover': 'var(--danger-90)',
    '--button-bg-active': 'var(--danger-90)',
    '--button-bg-disabled': 'var(--danger--40)',
  },
  soft: {
    '--button-bg': 'var(--app-bg)',
    '--button-bg-hover': 'var(--app-bg)',
    '--button-bg-active': 'var(--app-bg)',
    '--button-bg-disabled': 'var(--app-bg)',
    '--button-color': 'var(--link)',
    '--button-color-hover': 'var(--link)',
    '--button-color-active': 'var(--link)',
    '--button-color-disabled': 'var(--brand-bg--40)',
    '--button-border': '2px solid var(--brand-bg)',
    '--button-border-hover': '2px solid var(--brand-bg-90)',
    '--button-border-active': '2px solid var(--brand-bg-90)',
    '--button-border-disabled': '2px solid var(--brand-bg--40)',
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

type ButtonProps = {
  children?: ReactNode;
  disabled?: boolean;
  href?: string;
  loading?: boolean;
  look?: keyof typeof styleMap;
};

export const Button = forwardRefWithAs<'button', ButtonProps>(
  ({ as: Tag = 'button', href, look = 'default', disabled, loading, children, ...props }, ref) => {
    let Wrapper: FunctionComponent = Fragment;

    if (Tag === 'a' && !href) {
      Tag = 'button';
    }

    if (Tag === 'a') {
      disabled = null;
      Wrapper = ({ children }) => (
        <Link href={href} passHref>
          {children}
        </Link>
      );
    }

    if (look === 'text') {
      disabled = loading ? true : disabled;
      loading = false;
    }

    return (
      <Wrapper>
        <Tag
          ref={ref}
          css={{
            '&&': {
              // silly prose styles
              '--button-bg': 'var(--brand-bg)',
              '--button-bg-hover': 'var(--brand-bg-90)',
              '--button-bg-active': 'var(--brand-bg-90)',
              '--button-bg-disabled': 'var(--brand-bg--40)',
              '--button-border': '0 none',
              '--button-border-hover': 'var(--button-border)',
              '--button-border-active': 'var(--button-border)',
              '--button-border-disabled': 'var(--button-border)',
              '--button-color': '#fff',
              '--button-color-hover': 'var(--button-color)',
              '--button-color-active': 'var(--button-color)',
              '--button-color-disabled': 'var(--button-color)',
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
              border: 'var(--button-border)',
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
                color: 'var(--button-color-hover)',
                border: 'var(--button-border-hover)',
              },
              ':active': {
                boxShadow: 'var(--button-shadow-active)',
                transform: 'var(--button-transform-active)',
                background: 'var(--button-bg-active)',
                color: 'var(--button-color-active)',
                border: 'var(--button-border-active)',
              },
              ':disabled': {
                boxShadow: 'none',
                cursor: 'not-allowed',
                background: 'var(--button-bg-disabled)',
                opacity: '0.9',
                color: 'var(--button-color-disabled)',
                border: 'var(--button-border-disabled)',
                pointerEvents: 'none',
              },
              ':focus-visible': {
                outline: '1px dashed var(--focus)',
                outlineOffset: '3px',
              },
              '& svg': {
                display: 'inline-block',
                height: '0.8em',
                width: 'auto',
                verticalAlign: 'middle',
                marginLeft: '0.5rem',
              },
              ...styleMap[look],
            },
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
        </Tag>
      </Wrapper>
    );
  }
);

Button.displayName = 'Button';
