/** @jsx jsx */
import { jsx } from '@emotion/react';
import { Fragment } from 'react';

import { useMediaQuery } from '../lib/media';

function SkipLink({ href, children, ...props }) {
  return (
    <a
      href={href}
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
    >
      {children}
    </a>
  );
}

export function SkipLinks() {
  const mq = useMediaQuery();

  return (
    <Fragment>
      <SkipLink
        href="#skip-link-navigation"
        css={{
          display: ['none', null, 'block'],
        }}
      >
        Skip to Page Navigation
      </SkipLink>
      <SkipLink
        href="#skip-link-navigation-btn"
        css={mq({
          display: ['block', null, 'none'],
        })}
        onClick={
          () =>
            document
              .getElementById('skip-link-navigation-btn')
              .focus() /* don't judge me! I'm tired */
        }
      >
        Skip to Page Navigation
      </SkipLink>
      <SkipLink href="#skip-link-content">Skip to Content</SkipLink>
    </Fragment>
  );
}
