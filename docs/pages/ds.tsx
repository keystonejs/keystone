/** @jsx jsx */
import { Fragment, useState } from 'react';
import { jsx } from '@keystone-ui/core';

import { COLORS, TYPESCALE, TYPE, SPACE } from '../lib/TOKENS';
import { Highlight } from '../components/primitives/Highlight';
import { styleMap, Type } from '../components/primitives/Type';
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
      <Type as="h1" look="heading110" margin={'var(--space-large) 0'}>
        Design System
      </Type>
      <Type id="contents" as="h2" look="heading64" margin={'var(--space-large) 0'}>
        Contents
      </Type>
      <ul>
        <li>
          <Type as="a" look="text16" href="#colors">
            Colors
          </Type>
        </li>
        <li>
          <Type as="a" look="text16" href="#font-sizes">
            Font sizes
          </Type>
        </li>
        <li>
          <Type as="a" look="text16" href="#font-stacks">
            Font stacks
          </Type>
        </li>
        <li>
          <Type as="a" look="text16" href="#space">
            Spaces
          </Type>
        </li>
        <li>
          <Type as="a" look="text16" href="#type">
            Type
          </Type>
        </li>
        <li>
          <Type as="a" look="text16" href="#components">
            Components
          </Type>
        </li>
      </ul>
      <Divider />
      <Type id="colors" as="h2" look="heading64" margin={'var(--space-large) 0'}>
        Colors light
      </Type>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(8.75rem, 1fr))',
          gap: '0.5rem',
          background: COLORS.light['--app-bg'],
          padding: '2rem 0',
        }}
      >
        {Object.entries(COLORS.light).map(([name, color]) => (
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
      <Type id="colors" as="h2" look="heading64" margin={'var(--space-large) 0'}>
        Colors dark
      </Type>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(8.75rem, 1fr))',
          gap: '0.5rem',
          background: COLORS.dark['--app-bg'],
          padding: '2rem 0',
        }}
      >
        {Object.entries(COLORS.dark).map(([name, color]) => (
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
      <Type id="font-sizes" as="h2" look="heading64" margin={'var(--space-large) 0'}>
        Font sizes
      </Type>
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
      <Type id="font-stacks" as="h2" look="heading64" margin={'var(--space-large) 0'}>
        Font stacks
      </Type>
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
      <Type id="space" as="h2" look="heading64" margin={'var(--space-large) 0'}>
        Space
      </Type>
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
      <Type id="type" as="h2" look="heading64" margin={'var(--space-large) 0'}>
        Type
      </Type>
      {Object.keys(styleMap).map(style => (
        <Type key={style} id="type" look={style} css={{ display: 'block' }}>
          Type {style}
        </Type>
      ))}
      <Divider />
      <Type id="components" as="h2" look="heading64" margin={'var(--space-xxlarge) 0 0 0'}>
        Components
      </Type>
      <Type as="h3" look="heading24" margin={'var(--space-large) 0'}>
        InlineCode
      </Type>
      <InlineCode>this.is('code')</InlineCode>
      <Type as="h3" look="heading24" margin={'var(--space-large) 0'}>
        Status
      </Type>
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
      <Type as="h3" look="heading24" margin={'var(--space-large) 0'}>
        Emoji
      </Type>
      <Emoji symbol="❤️" alt="Love" />
      <Type as="h3" look="heading24" margin={'var(--space-large) 0'}>
        Stack
      </Type>
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
      <Type as="h3" look="heading24" margin={'var(--space-large) 0'}>
        Button
      </Type>
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
      <Type as="h3" look="heading24" margin={'var(--space-large) 0'}>
        Icons
      </Type>
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
      <Type as="h3" look="heading24" margin={'var(--space-large) 0'}>
        Badge
      </Type>
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
      <Type as="h3" look="heading24" margin={'var(--space-large) 0'}>
        Highlight
      </Type>
      <Type as="p" look="heading84">
        Highlighting a <Highlight>part of some text</Highlight>
      </Type>
      <Type
        as="p"
        look="heading84"
        css={{
          maxWidth: '10em',
          textAlign: 'right',
          margin: '0 0 0 auto',
        }}
      >
        Highlighting a <Highlight look="grad2">part of some text</Highlight>
      </Type>
      <Type as="p" look="heading110">
        Highlighting <Highlight look="grad3">a part</Highlight>
      </Type>
      <Type as="p" look="heading84">
        Highlighting a <Highlight look="grad4">part of</Highlight> some text
      </Type>
    </Page>
  );
}
