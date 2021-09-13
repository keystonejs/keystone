/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import { AnchorHTMLAttributes, Fragment, useCallback } from 'react';

import { useMediaQuery } from '../lib/media';

function SkipLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      css={{
        display: 'block',
        position: 'fixed',
        top: '-100rem',
        left: 0,
        right: 0,
        padding: '1rem',
        background: 'var(--app-bg)',
        color: 'var(--text-heading)',
        border: '3px solid var(--link)',
        zIndex: 2,
        ':focus': {
          top: 0,
        },
      }}
      {...props}
    />
  );
}

export function SkipLinks() {
  const mq = useMediaQuery();

  const skip = useCallback(
    () => () => {
      const skipTarget = document.getElementById('skip-link-navigation-btn');
      skipTarget?.focus();
    },
    []
  );

  return (
    <Fragment>
      <SkipLink
        href="#skip-link-navigation"
        css={mq({
          display: ['none', null, 'block'],
        })}
      >
        Skip to Page Navigation
      </SkipLink>
      <SkipLink
        href="#skip-link-navigation-btn"
        css={mq({
          display: ['block', null, 'none'],
        })}
        onClick={skip}
      >
        Skip to Page Navigation
      </SkipLink>
      <SkipLink href="#skip-link-content">Skip to Content</SkipLink>
    </Fragment>
  );
}
