/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Link from 'next/link';
import { Button } from '../../components/primitives/Button';
import { ArrowR } from '../../components/icons/ArrowR';
import { ComponentProps, HTMLAttributes, ReactNode } from 'react';

import { getServerSideProps } from '../../components/Markdown';
import { InlineCode } from '../../components/primitives/Code';
import { Alert } from '../../components/primitives/Alert';
import { Emoji } from '../../components/primitives/Emoji';
import { Type } from '../../components/primitives/Type';
import { DocsPage } from '../../components/Page';
import { useMediaQuery } from '../../lib/media';

type TimelineProps = {
  date: string;
  isLatest?: boolean;
  isFirst?: boolean;
} & HTMLAttributes<HTMLElement>;

function Timeline({ date, isLatest, isFirst, ...props }: TimelineProps) {
  return (
    <div
      css={{
        position: 'relative',
        ...(!isFirst && {
          ':after': {
            content: '""',
            position: 'absolute',
            left: '0.625rem',
            top: 0,
            bottom: 0,
            width: '1px',
            background: 'var(--muted)',
            zIndex: 2,
          },
        }),
      }}
      {...props}
    >
      <svg
        viewBox="0 0 27 27"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        css={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '1.375rem',
          zIndex: 3,
        }}
      >
        {isLatest && (
          <circle
            fill="#166BFF"
            cx="12.5"
            cy="12.5"
            r="12.5"
            stroke="var(--app-bg)"
            strokeWidth="4"
          />
        )}
        <circle
          fill={isLatest ? 'var(--brand)' : 'var(--muted)'}
          cx="12.5"
          cy="12.5"
          r="7"
          stroke="var(--app-bg)"
          strokeWidth="4"
        />
      </svg>
      <Type
        look="body14bold"
        css={{
          display: 'block',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          margin: '0.125rem 1rem 0 2rem',
        }}
      >
        {date}
      </Type>
    </div>
  );
}

type BoxProps = {
  link?: string;
  heading?: ReactNode;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>;

function Box({ link, heading, children, ...props }: BoxProps) {
  return (
    <Type
      as="div"
      look="body16"
      css={{
        margin: '0 0 2rem 0',
      }}
      {...props}
    >
      {heading && (
        <Type as="h3" look="heading20bold" margin="0 0 1rem 0">
          {heading}
        </Type>
      )}
      <Type as="p" look="body18" css={{ display: 'block' }}>
        {children}
      </Type>
      {link && (
        <Link href={link} passHref>
          <a>read more</a>
        </Link>
      )}
    </Type>
  );
}

export default function WhatsNew(props: ComponentProps<typeof DocsPage>) {
  const mq = useMediaQuery();

  return (
    <DocsPage noRightNav noProse {...props}>
      <Type as="h1" look="heading64">
        Latest Updates
      </Type>

      <Type as="p" look="body18" margin="1rem 0">
        An snapshot of how we’ve been improving Keystone lately. For more detail see our{' '}
        <a href="/releases">release notes</a>, and subscribe to notifications on
        <a href="https://github.com/keystonejs/keystone"> GitHub</a>.
      </Type>
      <Alert look="tip" css={{ margin: '1rem 0 3rem 0' }}>
        Want to know what’s in store?{' '}
        <Link href="/updates/roadmap">
          <a>Check out our roadmap</a>
        </Link>{' '}
        <Emoji symbol="🗺" alt="map" /> <Emoji symbol="🔮" alt="crystal ball" />
      </Alert>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['8.25rem auto', null, null, '12.5rem auto', '18rem auto'],
          gap: 0,
        })}
      >
        <Timeline date="29th June 2021" isLatest />
        <Box heading="New website">
          There’s a new home page, better explainers on <a href="/#how-it-works">how </a> Keystone
          works, and <a href="/why-keystone">why</a> it’s a good choice for projects that need to
          scale on their own terms. Navigating the docs is easier with breadcrumbs, indices for{' '}
          <a href="/docs/guides">Guides</a>, <a href="/docs/apis">APIs</a>, and{' '}
          <a href="/docs/walkthroughs">Walkthroughs</a>, and a better mobile menu.
        </Box>
        <Timeline date="21st June 2021" />
        <Box heading="New guides">
          In our contuing efforts to improve the developer documentation for Keystone 6, we’ve
          released the following guides:
          <ul>
            <li>
              <a href="/docs/guides/virtual-fields">Virtual fields</a>
            </li>
            <li>
              <a href="/docs/guides/hooks">Hooks</a>
            </li>
            <li>
              <a href="/docs/guides/filters">Query Filters</a>
            </li>
            <li>
              <a href="/docs/guides/relationships">Relationships</a>
            </li>
          </ul>
        </Box>
        <Timeline date="15th June 2021" />
        <Box link="/releases/2021-06-15" heading="New core">
          After months of work deep in the codebase, Keystone 6 now has a new core. This unblocks a
          bunch of roadmap features like custom field types, GraphQL Schema extensions, and more.
          The new core does bring some minor behavioural changes to Keystone’s APIs. See the release
          notes for more information.
        </Box>
        <Timeline date="15th June 2021" />
        <Box heading="Improved A11y for Admin UI">
          We’ve made accessibility updates to <InlineCode>DatePicker</InlineCode> labels,{' '}
          <InlineCode>relationship</InlineCode> fields, as well as visual improvements to segment
          control (when no value is selected), and more.
        </Box>
        <Timeline date="15th June 2021" />
        <Box heading="Text and Integer field filtering">
          A long awaited feature. Now you can find an item by a unique field. Filtering now works
          for{' '}
          <InlineCode>
            <a href="/docs/apis/fields#text">text</a>
          </InlineCode>{' '}
          and{' '}
          <InlineCode>
            <a href="/docs/apis/fields#integer">integer</a>
          </InlineCode>{' '}
          fields that have <InlineCode>isUnique: true</InlineCode> set.
        </Box>
        <Timeline date="2nd June 2021" />
        <Box heading="New JSON field">
          You can now use JSON blobs in your backend. Try it out in this{' '}
          <a href="https://github.com/keystonejs/keystone/tree/master/examples/json">
            example project
          </a>
          . It accepts any valid JSON node including:
          <ul>
            <li>
              <InlineCode>string</InlineCode>
            </li>
            <li>
              <InlineCode>number</InlineCode>
            </li>
            <li>
              <InlineCode>array</InlineCode>
            </li>
            <li>
              <InlineCode>object</InlineCode>
            </li>
          </ul>
        </Box>
        <Timeline date="1st June 2021" />
        <Box heading="Example projects collection">
          We now have a{' '}
          <a href="https://github.com/keystonejs/keystone/tree/master/examples">
            collection of example projects
          </a>{' '}
          you can run locally to learn more about a particular feature of Keystone. Each project
          comes with explainers on the how and why. Use them as a reference for best practice, and
          as a jumping off point when adding features to your own Keystone project.
        </Box>
        <Timeline date="22nd May 2021" />
        <Box heading="SQLite support with Prisma">
          You can now use SQLite to store data via Prisma. It includes support for the{' '}
          <InlineCode>file</InlineCode> and <InlineCode>cloudinary</InlineCode> field types, and
          lets you{' '}
          <a href="/docs/walkthroughs/embedded-mode-with-sqlite-nextjs">
            embed Keystone inside a Next.js frontend app
          </a>
          .
        </Box>
        <Timeline date="6th April 2021" />
        <Box link="/releases/2021-04-06" heading="Controlled code demolition">
          We’ve pruned a lot of code to make way for a more efficient and productive core in
          Keystone 6. Changes include:
          <ul>
            <li>
              Removed DB adapters and many redundant methods and arguments (now that Keystone 6 uses
              Prisma under the hood).
            </li>
            <li>
              Exchanged <InlineCode>deploy</InlineCode>, <InlineCode>reset</InlineCode> and{' '}
              <InlineCode>generate</InlineCode> commands for{' '}
              <InlineCode>keystone-next prisma</InlineCode> commands.
            </li>
          </ul>
        </Box>
        <Timeline date="19th March 2021" />
        <Box
          link="/docs/guides/keystone-5-vs-keystone-next"
          heading="Guidance on using Keystone 5 vs Keystone 6 "
        >
          Keystone 5 is now in maintenance mode while we focus all our efforts on building Keystone
          6. If you’re wondering which version to start your next project with, this guide is for
          you.
        </Box>
      </div>
      <Alert look="tip" css={{ margin: '2rem 0' }}>
        <span
          css={{
            display: 'inline-block',
            margin: '0 1rem 0.5rem 0',
          }}
        >
          Need answers to Keystone questions? Get help in our
        </span>
        <Button
          as="a"
          href="https://community.keystonejs.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Community Slack <ArrowR />
        </Button>
      </Alert>
    </DocsPage>
  );
}

export { getServerSideProps };
