/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import { Fragment, useState } from 'react';

import { COLORS, TYPESCALE, TYPE, SPACE } from '../lib/TOKENS';
import { Highlight } from '../components/primitives/Highlight';
import { InlineCode } from '../components/primitives/Code';
import { Status } from '../components/primitives/Status';
import { Button } from '../components/primitives/Button';
import { Badge } from '../components/primitives/Badge';
import { Emoji } from '../components/primitives/Emoji';
import { Stack } from '../components/primitives/Stack';
import * as allIcons from '../components/icons';
import { Page } from '../components/Page';

function Divider() {
  return (
    <hr
      css={{
        margin: '3rem',
        border: 'none',
        height: '0.4rem',
        backgroundImage:
          'linear-gradient(135deg, white 25%, transparent 25%),' +
          'linear-gradient(225deg, white 25%, transparent 25%),' +
          'linear-gradient(45deg, white 25%, transparent 25%),' +
          'linear-gradient(315deg, white 25%, transparent 25%)',
        backgroundPosition: '0.5rem 0, 0.5rem 0, 0 0, 0 0',
        backgroundSize: '1rem 0.4rem',
        backgroundRepeat: 'repeat',
        backgroundColor: 'var(--border)',
      }}
    />
  );
}

function Box() {
  return (
    <div
      css={{
        background: 'var(--text)',
        height: '2rem',
        width: '2rem',
        borderRadius: '3px',
      }}
    />
  );
}

export default function DS() {
  const [icon, setIcon] = useState(null);

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
      <Divider />
      <h2 id="colors">Colors</h2>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(8.75rem, 1fr))',
          gap: '0.5rem',
        }}
      >
        {Object.entries(COLORS).map(([name, color]) => (
          <div key={name} css={{ textAlign: 'center' }}>
            <div
              css={{
                display: 'inline-block',
                width: '4rem',
                height: '4rem',
                margin: '0 auto',
                border: '3px solid #fff',
                borderRadius: '100%',
                boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
                background: color,
              }}
            />
            <span
              css={{
                display: 'block',
                padding: '0 0 1rem 0',
              }}
            >
              <InlineCode>{name}</InlineCode>
            </span>
          </div>
        ))}
      </div>
      <Divider />
      <h2 id="font-sizes" css={{ marginTop: 'var(--space-xxlarge)' }}>
        Font sizes
      </h2>
      {Object.entries(TYPESCALE).map(([name]) => (
        <span
          key={name}
          css={{
            display: 'block',
            margin: 'var(--space-large) 0',
            fontSize: `var(${name})`,
          }}
        >
          {name}
        </span>
      ))}
      <Divider />
      <h2 id="font-stacks" css={{ marginTop: 'var(--space-xxlarge)' }}>
        Font stacks
      </h2>
      {Object.entries(TYPE).map(([name, stack]) => (
        <span
          key={name}
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
      <Divider />
      <h2 id="space" css={{ marginTop: 'var(--space-xxlarge)' }}>
        Space
      </h2>
      {Object.entries(SPACE).map(([name, size]) => (
        <Fragment key={name}>
          {name} - {size}
          <div
            css={{
              margin: 'var(--space-large) 0',
              width: `var(${name})`,
              height: `var(${name})`,
              background: 'var(--brand-bg)',
            }}
          />
        </Fragment>
      ))}
      <Divider />
      <h2 id="status" css={{ marginTop: 'var(--space-xxlarge)' }}>
        Components
      </h2>
      <h3 css={{ margin: 'var(--space-large) 0' }}>InlineCode</h3>
      <InlineCode>this.is('code')</InlineCode>
      <h3 css={{ margin: 'var(--space-large) 0' }}>Status</h3>
      <div
        css={{
          display: 'inline-grid',
          gap: '0.5rem',
          justifyItems: 'baseline',
        }}
      >
        <Status look="notStarted" />
        <Status look="figuringItOut" />
        <Status look="theresAPlan" />
        <Status look="makingItHappen" />
        <Status look="cleaningUp" />
      </div>
      <h3 css={{ margin: 'var(--space-large) 0' }}>Emoji</h3>
      <Emoji symbol="❤️" alt="Love" />
      <h3 css={{ margin: 'var(--space-large) 0' }}>Stack</h3>
      <Stack>
        <Box />
        <Box />
        <Box />
      </Stack>
      <br />
      <Stack orientation="horizontal" css={{ marginTop: '1rem' }}>
        <Box />
        <Box />
        <Box />
      </Stack>
      <h3 css={{ margin: 'var(--space-large) 0' }}>Button</h3>
      <div css={{ margin: 'var(--space-medium) 0' }}>
        <Stack orientation="horizontal">
          <Button>Button</Button>
          <Button disabled>Button</Button>
          <Button loading>Button</Button>
        </Stack>
      </div>
      <div css={{ margin: 'var(--space-medium) 0' }}>
        <Stack orientation="horizontal">
          <Button look="danger">Delete</Button>
          <Button look="danger" disabled>
            Delete
          </Button>
          <Button look="danger" loading>
            Delete
          </Button>
        </Stack>
      </div>
      <div css={{ margin: 'var(--space-medium) 0' }}>
        <Stack orientation="horizontal">
          <Button look="text">Logout</Button>
          <Button look="text" disabled>
            Logout
          </Button>
          <Button look="text" loading>
            Logout
          </Button>
        </Stack>
      </div>
      <h3 css={{ margin: 'var(--space-large) 0' }}>Icons</h3>
      Set icons to:
      <ul>
        <li>
          <label>
            No gradient{' '}
            <input
              type="radio"
              name="icon"
              checked={icon === null}
              onChange={() => setIcon(null)}
            />
          </label>
        </li>
        <li>
          <label>
            Gradient 1{' '}
            <input
              type="radio"
              name="icon"
              checked={icon === 'grad1'}
              onChange={() => setIcon('grad1')}
            />
          </label>
        </li>
        <li>
          <label>
            Gradient 2{' '}
            <input
              type="radio"
              name="icon"
              checked={icon === 'grad2'}
              onChange={() => setIcon('grad2')}
            />
          </label>
        </li>
        <li>
          <label>
            Gradient 3{' '}
            <input
              type="radio"
              name="icon"
              checked={icon === 'grad3'}
              onChange={() => setIcon('grad3')}
            />
          </label>
        </li>
        <li>
          <label>
            Gradient 4{' '}
            <input
              type="radio"
              name="icon"
              checked={icon === 'grad4'}
              onChange={() => setIcon('grad4')}
            />
          </label>
        </li>
      </ul>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(7.5rem, 1fr))',
          gap: '0.5rem',
        }}
      >
        {Object.entries(allIcons).map(([key, Icon]) => (
          <div
            key={key}
            css={{
              textAlign: 'center',
            }}
          >
            <Icon
              css={{
                display: 'block',
                height: '2rem',
                margin: '0 auto',
              }}
              grad={icon}
            />
            <InlineCode>{key}</InlineCode>
          </div>
        ))}
      </div>
      <h3 css={{ margin: 'var(--space-large) 0' }}>Badge</h3>
      <div
        css={{
          display: 'grid',
          gap: '0.5rem',
          justifyItems: 'baseline',
        }}
      >
        <Badge look="success">New</Badge>
        <Badge look="info">New</Badge>
        <Badge look="warning">New</Badge>
        <Badge look="danger">New</Badge>
      </div>
      <h3 css={{ margin: 'var(--space-large) 0' }}>Highlight</h3>
      <p
        css={{
          fontSize: '3rem',
          fontWeight: 900,
        }}
      >
        Highlighting a <Highlight>part of some text</Highlight>
      </p>
      <p
        css={{
          fontSize: '3rem',
          fontWeight: 900,
          maxWidth: '22ch',
          lineHeight: 1.2,
          textAlign: 'right',
        }}
      >
        Highlighting a <Highlight look="grad2">part of some text</Highlight>
      </p>
      <p
        css={{
          fontSize: '3rem',
          fontWeight: 900,
        }}
      >
        Highlighting a <Highlight look="grad3">part of some text</Highlight>
      </p>
      <p
        css={{
          fontSize: '3rem',
          fontWeight: 900,
        }}
      >
        Highlighting a <Highlight look="grad4">part of</Highlight> some text
      </p>
    </Page>
  );
}
