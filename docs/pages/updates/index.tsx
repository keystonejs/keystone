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
import { Stack } from '../../components/primitives/Stack';
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
      isIndexPage
    >
      <Type as="h1" look="heading64">
        Latest News
      </Type>

      <Type as="p" look="body18" margin="1rem 0">
        A snapshot of Keystone improvements and community happenings.
        <br />
        For more on updates see our{' '}
        <Link href="/releases">
          <a>release notes</a>
        </Link>
        , and subscribe to notifications on
        <a href="https://github.com/keystonejs/keystone" target="_blank" rel="noopener noreferrer">
          {' '}
          GitHub
        </a>
        .
      </Type>

      <Alert look="tip" css={{ margin: '2rem 0' }}>
        <span
          css={{
            display: 'inline-block',
            margin: '0 0.8rem 0.5rem 0',
          }}
        >
          What are we working on next? Check out our
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
        <Timeline date="5th October 2021" isLatest />
        <Box heading="New example: REST API endpoint">
          <a
            href="https://github.com/keystonejs/keystone/tree/main/examples/rest-api"
            target="_blank"
            rel="noopener noreferrer"
          >
            This example
          </a>{' '}
          shows you how to create REST endpoints by extending Keystone’s express app so you can use
          the Query API to execute queries against the schema.
        </Box>
        <Timeline date="21st September 2021" />
        <Box heading="Keystone Community Q&A + YouTube launch">
          <Stack orientation="horizontal">
            <a
              href="https://www.youtube.com/watch?v=r1IJh-iHm1c"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                width="100%"
                alt="Community Q&A thumbnail showing title"
                src="/assets/updates/qanda-1.png"
              />
            </a>
            <a
              href="https://www.youtube.com/watch?v=r1IJh-iHm1c"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                width="100%"
                alt="Community Q&A thumbnail showing Keystone team"
                src="/assets/updates/qanda-2.png"
              />
            </a>
          </Stack>
          <Stack orientation="horizontal">
            <a
              href="https://www.youtube.com/watch?v=r1IJh-iHm1c"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                width="100%"
                alt="Community Q&A thumbnail showing roadmap screenshot"
                src="/assets/updates/qanda-3.png"
              />
            </a>
            <a
              href="https://www.youtube.com/watch?v=r1IJh-iHm1c"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                width="100%"
                alt="Community Q&A thumbnail showing community question"
                src="/assets/updates/qanda-4.png"
              />
            </a>
          </Stack>
          Taking the chance to introduce the core team and address some community questions in
          person, the team held an online Q&A event and launched a YouTube channel at the same time.{' '}
          <a
            href="https://www.youtube.com/watch?v=r1IJh-iHm1c"
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch it online here
          </a>
          .
        </Box>
        <Timeline date="16th September 2021" />
        <Box heading="create-keystone-app now uses SQLite">
          Our CLI app now uses <InlineCode>SQLite</InlineCode> under the hood so you don’t have to
          spend time on DB config when trying out new ideas. We also updated the{' '}
          <Link href="/docs/walkthroughs/getting-started-with-create-keystone-app">
            <a>getting started walkthrough</a>
          </Link>{' '}
          to reflect this improvement.
        </Box>
        <Timeline date="15th September 2021" />
        <Box heading="Deployment examples for Heroku and Railway">
          Learn how to get your Keystone project on the web with our new one-click starters for{' '}
          <a
            href="https://github.com/keystonejs/keystone-6-heroku-example"
            target="_blank"
            rel="noopener noreferrer"
          >
            Heroku
          </a>{' '}
          and{' '}
          <a
            href="https://github.com/keystonejs/keystone-6-railway-example"
            target="_blank"
            rel="noopener noreferrer"
          >
            Railway
          </a>
          .
        </Box>
        <Timeline date="9th September 2021" />
        <Box heading="Prisma Meetup Korea">
          Jed spoke at Prisma Meetup Korea, covering V6 general availability, user-facing
          management, UI authentication, access control, business logic integrations and more.{' '}
          <a href="https://youtu.be/qKqSRTtOlmw?t=4101" target="_blank" rel="noopener noreferrer">
            Watch it online here
          </a>
          .
        </Box>
        <Timeline date="7th September 2021" />
        <Box heading="Next 11, Faster Startups, Custom Servers">
          Major release #2 of #3 planned ahead of Keystone 6 General Availability includes:
          <ul>
            <li>
              A better{' '}
              <Link href="/updates/new-access-control">
                <a>Access Control API</a>
              </Link>
            </li>
            <li>Customisable Express + GraphQL API paths</li>
            <li>Apollo Server introspection</li>
            <li>Omit GraphQL operations</li>
            <li>Faster startups in local dev</li>
            <li>Keystone has been updated to Next.js v11</li>
          </ul>
        </Box>
        <Timeline date="6th September 2021" />
        <Box heading="New & Improved Access Control API">
          Access Control is now easier to program, and makes it harder to introduce security gaps in
          your system.
          <ul>
            <li>
              The <strong>static</strong> approach to access control has been replaced. Now access
              control <strong>never</strong> effects the operations in your GraphQL API.
            </li>
            <li>
              Keystone used to return an <InlineCode>access denied</InlineCode> error from a{' '}
              <strong>query</strong> if an item couldn't be found, or explicitly had access denied.
              The improved API never returns that error type on a <strong>query</strong>.
            </li>
            <li>
              Access <strong>rules</strong> are now more explicit, and support fewer variations so
              you're less likely to introduce security gaps.
            </li>
          </ul>
          To securely upgrade your system, follow the instructions in our{' '}
          <Link href="/updates/new-access-control">
            <a>Access Control upgrade guide</a>
          </Link>
          .
        </Box>
        <Timeline date="6th September 2021" />
        <Box heading="Customisable Express App">
          A long awaited feature, the Express App that Keystone creates is now{' '}
          <Link href="/docs/apis/config#server">
            <a>customisable</a>
          </Link>{' '}
          with the new <InlineCode>extendExpressApp</InlineCode> option:
          <ul>
            <li>Add your own custom server routes</li>
            <li>Host two apps on separate ports</li>
            <li>And more...</li>
          </ul>
        </Box>
        <Timeline date="6th September 2021" />
        <Box heading="GraphQL Path Customisation">
          The GraphQL endpoint accessible by default at `/api/graphql` can now be customised with
          the new option <InlineCode>config.graphql.path</InlineCode>. You can find this and all
          other options in our{' '}
          <Link href="/docs/apis/config#graphql">
            <a>GraphQL API docs</a>
          </Link>
          .
        </Box>
        <Timeline date="17th August 2021" />
        <Box heading="New & improved GraphQL API">
          A major milestone in the path to a <InlineCode>General Availability</InlineCode> status
          for <strong>Keystone 6</strong>, we've just released a new and improved GraphQL API.{' '}
          <Emoji symbol="🎉" alt="Celebration" />
          <br />
          <br />
          We’ve made the experience of working with Keystone’s GraphQL API easier to program and
          reason about: We've{' '}
          <Link href="/updates/new-graphql-api">
            <a>written a complete guide</a>
          </Link>{' '}
          to the improvements we've made, and it includes a{' '}
          <Link href="/updates/new-graphql-api#upgrade-checklist">
            <a>checklist of the steps you need to take to upgrade your Keystone projects</a>
          </Link>
          . Be sure to check it out!
        </Box>
        <Timeline date="29th July 2021" />
        <Box heading="Admin UI Customizations">
          We're opening Admin UI up to support a more personal content experience. Now you can:
          <ul>
            <li>
              embed your own{' '}
              <Link href="/docs/guides/custom-admin-ui-logo">
                <a>custom logo</a>
              </Link>
              ,
            </li>
            <li>
              add{' '}
              <Link href="/docs/guides/custom-admin-ui-pages">
                <a>custom pages</a>
              </Link>{' '}
              with Admin UI routes, and
            </li>
            <li>
              link to them (and elsewhere) with{' '}
              <Link href="/docs/guides/custom-admin-ui-navigation">
                <a>custom navigation</a>
              </Link>
              .
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
          <a
            href="https://github.com/keystonejs/prisma-day-2021-workshop"
            target="_blank"
            rel="noopener noreferrer"
          >
            Follow along in with the repo
          </a>{' '}
          as Jed builds a front and back-end for a Blog app with Prisma, KeystoneJS, GraphQL,
          Next.js and Tailwind, that gives you:
          <ul>
            <li>
              Public{' '}
              <Link href="/docs/apis/auth">
                <a>auth</a>
              </Link>{' '}
              and signup
            </li>
            <li>
              Role-based{' '}
              <Link href="/docs/apis/access-control">
                <a>access control</a>
              </Link>
            </li>
            <li>
              Custom components in the{' '}
              <Link href="/docs/guides/document-field-demo">
                <a>document field</a>
              </Link>
            </li>
          </ul>
          Editors can embed audience Polls in post content, and authenticated visitors can make
          their vote count in the frontend.
        </Box>
        <Timeline date="29th June 2021" />
        <Box heading="New example: Custom Field Views">
          Learn how to create a{' '}
          <a
            href="https://github.com/keystonejs/keystone/tree/main/examples/custom-field-view"
            target="_blank"
            rel="noopener noreferrer"
          >
            custom field view
          </a>{' '}
          for a <InlineCode>JSON</InlineCode> field that lets users users add, edit and remove
          navigation items from a list.
        </Box>
        <Timeline date="10th July 2021" />
        <Box heading="Watch Jed's Prisma Day talk">
          Jed's talk at Prisma Day 2021 is a great overview into what makes Keystone special. Watch
          below, or{' '}
          <Link href="/updates/prisma-day-2021">
            <a>read the full transcript</a>
          </Link>
          .
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
          and background on{' '}
          <Link href="/why-keystone">
            <a>why Keystone</a>
          </Link>{' '}
          is built for projects that need to scale on their own terms. Navigating the docs is easier
          with breadcrumbs, index pages for{' '}
          <Link href="/docs/walkthroughs">
            <a>Walkthroughs</a>
          </Link>
          ,{' '}
          <Link href="/docs/guides">
            <a>Guides</a>
          </Link>
          , and{' '}
          <Link href="/docs/apis">
            <a>APIs</a>
          </Link>
          , and a better mobile experience. We hope you like it ❤️
        </Box>
        <Timeline date="21st June 2021" />
        <Box heading="New guides">
          In our contuing efforts to improve the developer documentation for Keystone 6, we’ve
          written the following guides:
          <ul>
            <li>
              <Link href="/docs/guides/virtual-fields">
                <a>Virtual fields</a>
              </Link>
            </li>
            <li>
              <Link href="/docs/guides/relationships">
                <a>Relationships</a>
              </Link>
            </li>
            <li>
              <Link href="/docs/guides/hooks">
                <a>Hooks</a>
              </Link>
            </li>
            <li>
              <Link href="/docs/guides/filters">
                <a>Query Filters</a>
              </Link>
            </li>
            <li>
              <Link href="/docs/guides/testing">
                <a>Testing</a>
              </Link>
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
            <Link href="/docs/apis/fields#text">
              <a>text</a>
            </Link>
          </InlineCode>{' '}
          and{' '}
          <InlineCode>
            <Link href="/docs/apis/fields#integer">
              <a>integer</a>
            </Link>
          </InlineCode>{' '}
          fields that have <InlineCode>isUnique: true</InlineCode> set.
        </Box>
        <Timeline date="2nd June 2021" />
        <Box heading="New JSON field">
          You can now use JSON blobs in your backend, and provide your own React UI components to
          edit them. Try it out in this{' '}
          <a
            href="https://github.com/keystonejs/keystone/tree/main/examples/json"
            target="_blank"
            rel="noopener noreferrer"
          >
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
          <a
            href="https://github.com/keystonejs/keystone/tree/main/examples"
            target="_blank"
            rel="noopener noreferrer"
          >
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
          <Link href="/docs/walkthroughs/embedded-mode-with-sqlite-nextjs">
            <a>embed Keystone inside a Next.js frontend app</a>
          </Link>
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
          link="/updates/keystone-5-vs-keystone-6-preview"
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
