/** @jsx jsx */
import { Fragment, useState } from 'react';
import { jsx } from '@emotion/react';

import { CodeWindow, WindowWrapper, WindowL, WindowR } from '../components/marketing/CodeWindow';
import { GitHubButton } from '../components/primitives/GitHubButton';
import { COLORS, TYPESCALE, TYPE, SPACE } from '../lib/TOKENS';
import { Highlight } from '../components/primitives/Highlight';
import { styleMap, Type } from '../components/primitives/Type';
import { InlineCode } from '../components/primitives/Code';
import { Status } from '../components/primitives/Status';
import { Button } from '../components/primitives/Button';
import { Alert } from '../components/primitives/Alert';
import { Badge } from '../components/primitives/Badge';
import { Emoji } from '../components/primitives/Emoji';
import { Stack } from '../components/primitives/Stack';
import { Field } from '../components/primitives/Field';
import { Well } from '../components/primitives/Well';
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

type SwatchProps = {
  name?: string;
  color?: string;
  gradient?: { grad1: string; grad2: string };
};

function Swatch({ name, color, gradient }: SwatchProps) {
  return (
    <div css={{ textAlign: 'center' }}>
      <div
        css={{
          display: 'inline-block',
          width: '4rem',
          height: '4rem',
          margin: '0 auto',
          border: '3px solid #fff',
          borderRadius: '100%',
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
          background: gradient
            ? `linear-gradient(135deg, ${gradient.grad1} 4.86%, ${gradient.grad2} 97.92%)`
            : color,
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
  );
}

export default function DS() {
  const [icon, setIcon] = useState<allIcons.IconGradient | null>(null);
  let firstGrad: string;

  return (
    <Page>
      <Type as="h1" look="heading92" margin={'var(--space-large) 0'}>
        Design System
      </Type>
      <Type id="contents" as="h2" look="heading64" margin={'var(--space-large) 0'}>
        Contents
      </Type>
      <ul>
        <li>
          <Type as="a" look="body16" href="#colors">
            Colors
          </Type>
        </li>
        <li>
          <Type as="a" look="body16" href="#font-sizes">
            Font sizes
          </Type>
        </li>
        <li>
          <Type as="a" look="body16" href="#font-stacks">
            Font stacks
          </Type>
        </li>
        <li>
          <Type as="a" look="body16" href="#space">
            Spaces
          </Type>
        </li>
        <li>
          <Type as="a" look="body16" href="#type">
            Type
          </Type>
        </li>
        <li>
          <Type as="a" look="body16" href="#components">
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
        {Object.entries(COLORS.light)
          .filter(([name]) => name !== '--theme')
          .filter(([name]) => !name.startsWith('--grad'))
          .map(([name, color]) => (
            <Swatch key={`light-${name}`} name={name} color={color} />
          ))}

        {Object.entries(COLORS.light)
          .filter(([name]) => name.startsWith('--grad'))
          .map(([name, color]) => {
            if (name.endsWith('-2')) {
              return (
                <Swatch
                  key={`light-grad-${name}`}
                  name={name.split('-')[2]}
                  gradient={{ grad1: firstGrad, grad2: color }}
                />
              );
            } else {
              firstGrad = color;
            }
          })}
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
        {Object.entries(COLORS.dark)
          .filter(([name]) => name !== '--theme')
          .filter(([name]) => !name.startsWith('--grad'))
          .map(([name, color]) => (
            <Swatch key={`dark-${name}`} name={name} color={color} />
          ))}
        {Object.entries(COLORS.dark)
          .filter(([name]) => name.startsWith('--grad'))
          .map(([name, color]) => {
            if (name.endsWith('-2')) {
              return (
                <Swatch
                  key={`light-grad-${name}`}
                  name={name.split('-')[2]}
                  gradient={{ grad1: firstGrad, grad2: color }}
                />
              );
            } else {
              firstGrad = color;
            }
          })}
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
      {(Object.keys(styleMap) as Array<keyof typeof styleMap>).map(style => (
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
        Alert
      </Type>
      <Stack block>
        <Alert>Neutral alert</Alert>
        <Alert look="tip">Warning alert</Alert>
        <Alert look="warn">Warning alert</Alert>
        <Alert look="error">Error alert</Alert>
      </Stack>
      <Type as="h3" look="heading24" margin={'var(--space-large) 0'}>
        Well
      </Type>
      <Stack orientation="horizontal" block css={{ alignItems: 'stretch' }}>
        <Well heading="Getting started with Keystone 6" href="/">
          Learn how to use our CLI to get Keystone’s Admin UI and GraphQL API running in a new local
          project folder.
        </Well>
        <Well heading="How to embed Keystone + SQLite in a Next.js app" href="/">
          Learn how to run Keystone in the same folder as your frontend code and commit everything
          to Git. You end up with a queryable GraphQL endpoint running live on Vercel for free.
        </Well>
      </Stack>
      <Stack orientation="horizontal" block css={{ alignItems: 'stretch', marginTop: '1rem' }}>
        <Well grad="grad2" heading="Getting started with Keystone 6" href="/">
          Learn how to use our CLI to get Keystone’s Admin UI and GraphQL API running in a new local
          project folder.
        </Well>
        <Well grad="grad2" heading="How to embed Keystone + SQLite in a Next.js app" href="/">
          Learn how to run Keystone in the same folder as your frontend code and commit everything
          to Git. You end up with a queryable GraphQL endpoint running live on Vercel for free.
        </Well>
      </Stack>
      <Stack orientation="horizontal" block css={{ alignItems: 'stretch', marginTop: '1rem' }}>
        <Well grad="grad3" heading="Getting started with Keystone 6" href="/">
          Learn how to use our CLI to get Keystone’s Admin UI and GraphQL API running in a new local
          project folder.
        </Well>
        <Well grad="grad3" heading="How to embed Keystone + SQLite in a Next.js app" href="/">
          Learn how to run Keystone in the same folder as your frontend code and commit everything
          to Git. You end up with a queryable GraphQL endpoint running live on Vercel for free.
        </Well>
      </Stack>
      <Stack orientation="horizontal" block css={{ alignItems: 'stretch', marginTop: '1rem' }}>
        <Well grad="grad4" heading="Getting started with Keystone 6" href="/">
          Learn how to use our CLI to get Keystone’s Admin UI and GraphQL API running in a new local
          project folder.
        </Well>
        <Well grad="grad4" heading="How to embed Keystone + SQLite in a Next.js app" href="/">
          Learn how to run Keystone in the same folder as your frontend code and commit everything
          to Git. You end up with a queryable GraphQL endpoint running live on Vercel for free.
        </Well>
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
          <Button look="soft">Delete</Button>
          <Button look="soft" disabled>
            Delete
          </Button>
          <Button look="soft" loading>
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
      <div css={{ margin: 'var(--space-medium) 0' }}>
        <Stack orientation="horizontal">
          <Button as="a" href="/ds" look="soft">
            Get Started
          </Button>
          <Button as="a" href="/docs" look="soft">
            Get Started <allIcons.ArrowR />
          </Button>
          <Button as="a" href="/" look="soft">
            Get Started
          </Button>
        </Stack>
      </div>
      <Type as="h3" look="heading24" margin={'var(--space-large) 0'}>
        Field
      </Type>
      <Stack block>
        <Field placeholder="Placeholder text" />
        <Field disabled defaultValue="Some disabled text" />
      </Stack>
      <Type as="h3" look="heading24" margin={'var(--space-large) 0'}>
        GitHubButton
      </Type>
      <GitHubButton repo="keystonejs/keystone" />
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
        <li>
          <label>
            Gradient 5{' '}
            <input
              type="radio"
              name="icon"
              checked={icon === 'grad5'}
              onChange={() => setIcon('grad5')}
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
        CodeWindow
      </Type>
      <Stack>
        <CodeWindow lines={2}>
          Some code...
          <br />
          Some code... Some code... Some code... Some code... Some code... Some code... Some code...
          Some code... Some code... Some code... Some code... Some code... Some code... Some code...
          Some code... Some code... Some code... Some code... Some code... Some code...
        </CodeWindow>
        <CodeWindow lines={13}>
          Some code...
          <br />
          Some code...
          <br />
          Some code...
          <br />
          Some code...
          <br />
          Some code...
          <br />
          Some code...
          <br />
          Some code...
          <br />
          Some code...
          <br />
          Some code...
          <br />
          Some code...
          <br />
          Some code...
          <br />
          Some code...
          <br />
          Some code...
          <br />
        </CodeWindow>
        <CodeWindow lines={8}>
          <WindowWrapper>
            <WindowL>
              {`{
  allPosts (first: 2, where: { title_contains: "content" }) {
    title
    author {
      name
    }
  }
}`}
            </WindowL>
            <WindowR>
              {`{
  "data": {
    "allPosts": [
      {
        "title": "Why structured content content  benefits of structured",
        "author": {
          "name": "Tim"
        }
      },   
      {
        "title": "Content Management for the Design System generation",
        "author": {
          "name": "Lauren"
        }
      }
    ]
  }
}`}
            </WindowR>
          </WindowWrapper>
        </CodeWindow>
      </Stack>
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
      <Type as="p" look="heading92">
        Highlighting <Highlight look="grad3">a part</Highlight>
      </Type>
      <Type as="p" look="heading84">
        Highlighting a <Highlight look="grad4">part of</Highlight> some text
      </Type>
      <Type as="p" look="heading84">
        Highlighting a <Highlight look="grad5">part of</Highlight> some text
      </Type>
    </Page>
  );
}
