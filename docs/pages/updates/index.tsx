/** @jsx jsx  */
import { HTMLAttributes, ReactNode } from 'react';
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { getStaticProps } from '../../components/Markdown';
import { InlineCode } from '../../components/primitives/Code';
import { Button } from '../../components/primitives/Button';
import { Alert } from '../../components/primitives/Alert';
import { Type } from '../../components/primitives/Type';
import { DocsPage } from '../../components/Page';
import { ArrowR } from '../../components/icons/ArrowR';
import { Emoji } from '../../components/primitives/Emoji';
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
          <a css={{ display: 'inline-flex', alignItems: 'center', marginTop: '0.5rem' }}>
            Read more <ArrowR css={{ height: '1.2rem' }} />
          </a>
        </Link>
      )}
    </Type>
  );
}

export default function WhatsNew() {
  const mq = useMediaQuery();

  return (
    <DocsPage
      noRightNav
      noProse
      title={'Latest News'}
      description={'What’s new with Keystone. A snapshot of announcements and recent releases.'}
    >
      <Type as="h1" look="heading64">
        Latest News
      </Type>

      <Type as="p" look="body18" margin="1rem 0">
        A snapshot of improvements we've landed recently in Keystone.
        <br />
        For more detail see our{' '}
        <Link href="/releases">
          <a>release notes</a>
        </Link>
        , and subscribe to notifications on
        <a href="https://github.com/keystonejs/keystone"> GitHub</a>.
      </Type>

      <Alert look="tip" css={{ margin: '2rem 0' }}>
        <span
          css={{
            display: 'inline-block',
            margin: '0 0.8rem 0.5rem 0',
          }}
        >
          Where are we up to, and what we're working on next? Check out our
        </span>
        <Button as="a" href="/updates/roadmap" rel="noopener noreferrer">
          Roadmap <ArrowR />
        </Button>
      </Alert>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['8.25rem auto', null, null, '12.5rem auto', '18rem auto'],
          gap: 0,
        })}
      >
        <Timeline date="17th August 2021" isLatest />
        <Box heading="A new and improved GraphQL API">
          A major milestone in the path to a <InlineCode>General Availability</InlineCode> status
          for <strong>Keystone 6</strong>, we've just released a new and improved GraphQL API.{' '}
          <Emoji symbol="🎉" alt="Celebration" />
          <br />
          <br />
          We’ve made the experience of working with Keystone’s GraphQL API easier to program and
          reason about: We've{' '}
          <a href="https://keystonejs.com/updates/new-graphql-api">written a complete guide</a> to
          the improvements we've made, and it includes a{' '}
          <a href="https://keystonejs.com/updates/new-graphql-api#upgrade-checklist">
            checklist of the steps you need to take to upgrade your Keystone projects
          </a>
          .
          <br />
          <br />
          Be sure to check it out!
        </Box>
        <Timeline date="29th July 2021" />
        <Box heading="Admin UI Customizations">
          We're opening Admin UI up to support a more personal content experience. Now you can:
          <ul>
            <li>
              embed your own <a href="/docs/guides/custom-admin-ui-logo">custom logo</a>,
            </li>
            <li>
              add <a href="/docs/guides/custom-admin-ui-pages">custom pages</a> with Admin UI
              routes, and
            </li>
            <li>
              link to them (and elsewhere) with{' '}
              <a href="/docs/guides/custom-admin-ui-navigation">custom navigation</a>.
            </li>
          </ul>
          To deliver a more productive editor experience that's aligned with the needs and brand of
          your organisation.
        </Box>
        <Timeline date="29th July 2021" />
        <Box link="/docs/apis/config#health-check" heading="New Health Check endpoint">
          We've added an optional <InlineCode>/_healthcheck</InlineCode> endpoint to Keystone's
          express server. Use it to ensure your Keystone instance is up and running with website
          monitoring solutions.
        </Box>
        <Timeline date="10th July 2021" />
        <Box heading="Watch Jed's Prisma Day workshop">
          <div
            css={{
              position: 'relative',
              paddingBottom: '56.25%',
              marginBottom: '1.25rem',
              height: '0',
            }}
          >
            <iframe
              css={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
              }}
              width="560"
              height="315"
              src="https://www.youtube-nocookie.com/embed/Z-0_qlxNpm4?rel=0"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <a href="https://github.com/keystonejs/prisma-day-2021-workshop">
            Follow along in with the repo
          </a>{' '}
          as Jed builds a front and back-end for a Blog app with Prisma, KeystoneJS, GraphQL,
          Next.js and Tailwind, that gives you:
          <ul>
            <li>
              Public <a href="/docs/guides/auth">auth</a> and signup
            </li>
            <li>
              Role-based <a href="/docs/guides/access-control">access control</a>
            </li>
            <li>
              Custom components in the <a href="/docs/guides/document-field-demo">document field</a>
            </li>
          </ul>
          Editors can embed audience Polls in post content, and authenticated visitors can make
          their vote count in the frontend.
        </Box>
        <Timeline date="29th June 2021" />
        <Box heading="New example: Custom Field Views">
          Learn how to create a{' '}
          <a href="https://github.com/keystonejs/keystone/tree/master/examples/custom-field-view">
            custom field view
          </a>{' '}
          for a <InlineCode>JSON</InlineCode> field that lets users users add, edit and remove
          navigation items from a list.
        </Box>
        <Timeline date="10th July 2021" />
        <Box heading="Watch Jed's Prisma Day talk">
          Jed's talk at Prisma Day 2021 is a great overview into what makes Keystone special. Watch
          below, or <a href="/updates/prisma-day-2021">read the full transcript</a>.
          <div
            css={{
              position: 'relative',
              paddingBottom: '56.25%',
              marginTop: '1.25rem',
              height: '0',
            }}
          >
            <iframe
              css={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
              }}
              width="560"
              height="315"
              src="https://www.youtube-nocookie.com/embed/fPWRlmedCbo?rel=0"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Box>
        <Timeline date="29th June 2021" />
        <Box heading="New website">
          We've launched our new website for <strong>Keystone 6</strong>! There’s a new home page,
          and background on <a href="/why-keystone">why Keystone</a> is built for projects that need
          to scale on their own terms. Navigating the docs is easier with breadcrumbs, index pages
          for <a href="/docs/walkthroughs">Walkthroughs</a>, <a href="/docs/guides">Guides</a>, and{' '}
          <a href="/docs/apis">APIs</a>, and a better mobile experience. We hope you like it ❤️
        </Box>
        <Timeline date="21st June 2021" />
        <Box heading="New guides">
          In our contuing efforts to improve the developer documentation for Keystone 6, we’ve
          written the following guides:
          <ul>
            <li>
              <a href="/docs/guides/virtual-fields">Virtual fields</a>
            </li>
            <li>
              <a href="/docs/guides/relationships">Relationships</a>
            </li>
            <li>
              <a href="/docs/guides/hooks">Hooks</a>
            </li>
            <li>
              <a href="/docs/guides/filters">Query Filters</a>
            </li>
            <li>
              <a href="/docs/guides/testing">Testing</a>
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
        <Box heading="Improved accessibility (a11y) in the Admin UI">
          We’ve made accessibility updates to <InlineCode>DatePicker</InlineCode> labels,{' '}
          <InlineCode>relationship</InlineCode> fields, as well as visual improvements to segment
          control (when no value is selected), and more.
        </Box>
        <Timeline date="15th June 2021" />
        <Box heading="Unique Text and Integer field filtering">
          A long awaited feature: you can now find an item by unique fields in your schema. It works
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
          You can now use JSON blobs in your backend, and provide your own React UI components to
          edit them. Try it out in this{' '}
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
        <Timeline date="19th March 2021" isFirst />
        <Box
          link="/docs/guides/keystone-5-vs-keystone-6-preview"
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

export { getStaticProps };
