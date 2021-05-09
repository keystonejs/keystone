/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import { Fragment } from 'react';

import { COLORS, TYPESCALE, TYPE, SPACE } from '../lib/TOKENS';
import { Page } from '../components/Page';

export default function DS() {
  return (
    <Page>
      <h1>DS</h1>

      <h2>Contents</h2>
      <ul>
        <li>
          <a href="#colors">Colors</a>
        </li>
        <li>
          <a href="#font-sizes">Font sizes</a>
        </li>
        <li>
          <a href="#font-stacks">Font stacks</a>
        </li>
        <li>
          <a href="#space">Spaces</a>
        </li>
      </ul>

      <h2 id="colors">Colors</h2>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '0.5rem',
        }}
      >
        {Object.entries(COLORS).map(([name, color]) => (
          <Fragment>
            <span
              css={{
                display: 'inline-block',
                padding: '1rem 0',
                textAlign: 'right',
              }}
            >
              {name}
            </span>
            <div css={{ background: color }} />
          </Fragment>
        ))}
      </div>

      <h2 id="font-sizes" css={{ marginTop: 'var(--space-xxlarge)' }}>
        Font sizes
      </h2>
      {Object.entries(TYPESCALE).map(([name]) => (
        <span
          css={{
            display: 'block',
            margin: 'var(--space-large) 0',
            fontSize: `var(${name})`,
          }}
        >
          {name}
        </span>
      ))}

      <h2 id="font-stacks" css={{ marginTop: 'var(--space-xxlarge)' }}>
        Font stacks
      </h2>
      {Object.entries(TYPE).map(([name, stack]) => (
        <span
          css={{
            display: 'block',
            margin: 'var(--space-large) 0',
            fontSize: 'var(--font-large)',
            fontFamily: `var(${name})`,
          }}
        >
          {name} aAgGzZij
          <br />
          {stack}
        </span>
      ))}

      <h2 id="space" css={{ marginTop: 'var(--space-xxlarge)' }}>
        Space
      </h2>
      {Object.entries(SPACE).map(([name, size]) => (
        <Fragment>
          {name} - {size}
          <div
            css={{
              margin: 'var(--space-large) 0',
              width: `var(${name})`,
              height: `var(${name})`,
              background: 'var(--blue-500)',
            }}
          />
        </Fragment>
      ))}
    </Page>
  );
}
