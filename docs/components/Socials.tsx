/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Twitter } from './icons/Twitter';
import { GitHub } from './icons/GitHub';
import { Slack } from './icons/Slack';

export function Socials({ noGitHub, ...props }) {
  return (
    <div
      css={{
        display: 'inline-grid',
        gridTemplateColumns: noGitHub ? '1fr 1fr' : '1fr 1fr 1fr',
        gap: 'var(--space-large)',
        alignItems: 'center',
        marginLeft: 'auto',
      }}
      {...props}
    >
      {!noGitHub && (
        <a
          href="https://github.com/keystonejs/keystone"
          target="_blank"
          rel="noopener noreferrer"
          css={{
            display: 'inline-flex',
            padding: 0,
            justifyContent: 'center',
            borderRadius: '100%',
            color: 'currentColor',
            transition: 'color 0.3s ease',
            ':hover': {
              color: '#000',
            },
          }}
        >
          <GitHub css={{ height: '1.5em' }} />
        </a>
      )}

      <a
        href="https://twitter.com/keystonejs"
        target="_blank"
        rel="noopener noreferrer"
        css={{
          display: 'inline-flex',
          padding: 0,
          justifyContent: 'center',
          borderRadius: '100%',
          color: 'currentColor',
          transition: 'color 0.3s ease',
          ':hover': {
            color: '#1da1f2',
          },
        }}
      >
        <Twitter css={{ height: '1.5em' }} />
      </a>

      <a
        href="https://community.keystonejs.com/"
        target="_blank"
        rel="noopener noreferrer"
        css={{
          display: 'inline-flex',
          padding: 0,
          justifyContent: 'center',
          borderRadius: '100%',
          color: 'currentColor',
          '.slack-color': {
            fill: 'currentColor',
            transition: 'fill 0.3s ease',
          },
          '&:hover .slack-color1': {
            fill: '#e01e5a',
          },
          '&:hover .slack-color2': {
            fill: '#36c5f0',
          },
          '&:hover .slack-color3': {
            fill: '#2eb67d',
          },
          '&:hover .slack-color4': {
            fill: '#ecb22e',
          },
        }}
      >
        <Slack css={{ height: '1.5em' }} />
      </a>
    </div>
  );
}
