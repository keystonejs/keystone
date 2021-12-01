/** @jsxRuntime classic */
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
        <Timeline date="29th November 2021" isLatest />
        <Box heading="Welcome Keystone 6 to General Availability!">
          <svg viewBox="0 0 1336 752" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#a)">
              <path fill="url(#bg)" d="M0 0h1336v751.5H0z" />
              <g filter="url(#b)">
                <path
                  d="M1652.39 943.93c0 274.73-440.73 497.44-984.39 497.44s-984.4-222.71-984.4-497.44S124.35 446.48 668 446.48c413.93-20.07 984.39 222.72 984.39 497.45Z"
                  fill="url(#blob)"
                />
              </g>
              <g filter="url(#d)">
                <path
                  d="M282.04 557.38v-35.32l10.81-12.97 34.28 48.29h28.9l-45.72-64.3 42.76-51.26h-26.9l-43.4 52.7h-.73v-52.7h-24.18v115.56h24.18Z"
                  fill="url(#keystone)"
                />
                <path
                  d="M397.2 486.99c10.4 0 17.53 7.52 18.01 18.5h-36.43c.8-10.74 8.17-18.5 18.42-18.5Zm18.33 44.12c-2.16 6.57-8.72 10.81-17.3 10.81-11.93 0-19.7-8.4-19.7-20.66v-1.44h59.19v-7.13c0-26.1-15.78-43-40.77-43-25.38 0-41.4 17.78-41.4 45.16 0 27.47 15.86 44.37 42.29 44.37 21.22 0 36.6-11.3 39.15-28.11h-21.46Z"
                  fill="url(#keystone)"
                />
                <path
                  d="M459.5 589.17c21.94 0 32.67-7.85 40.04-29.87l29.54-87.77h-24.66l-18.26 67.1h-.4l-18.26-67.1h-25.7l29.87 85.93c.16.32-.72 3.76-.72 4.08-1.6 6.8-5.85 9.53-14.42 9.53-.88 0-5.12 0-5.84-.16v18.02c.72.16 8 .24 8.8.24Z"
                  fill="url(#keystone)"
                />
                <path
                  d="M535.65 496.76c0 12.65 8.33 21.14 24.58 24.82l15.86 3.52c7.69 1.85 10.57 4.25 10.57 8.57 0 5.6-5.37 9.13-14.25 9.13-9.3 0-14.98-4.16-16.1-11.37H533.5c1.28 16.74 15.37 27.79 38.28 27.79 22.66 0 38.2-11.13 38.2-28.03 0-12.81-6.97-19.62-24.2-23.46l-16.4-3.53c-7.53-1.76-11.22-4.64-11.22-8.88 0-5.53 5.29-9.21 13.38-9.21 8.64 0 14.17 4.24 14.65 11.13h21.54c-.32-16.66-14.33-27.55-35.87-27.55-22.03 0-36.2 10.73-36.2 27.07Z"
                  fill="url(#keystone)"
                />
                <path
                  d="M627.9 451.75v19.78h-12.1v17.62h12.1v45.08c0 16.74 7.85 23.47 28.03 23.47 4.72 0 8.73-.4 11.13-.97v-17.21c-1.44.24-3.6.4-5.69.4-6.88 0-10.09-3.12-10.09-9.7v-41.07h15.86v-17.62h-15.86v-19.78H627.9Z"
                  fill="url(#keystone)"
                />
                <path
                  d="M718.07 559.22c25.94 0 42.52-16.58 42.52-44.85 0-27.86-16.82-44.68-42.52-44.68-25.7 0-42.52 16.9-42.52 44.68 0 28.2 16.57 44.85 42.52 44.85Zm0-17.86c-11.53 0-18.82-9.69-18.82-26.9 0-17.06 7.45-26.91 18.82-26.91 11.37 0 18.74 9.85 18.74 26.9 0 17.22-7.29 26.91-18.74 26.91Z"
                  fill="url(#keystone)"
                />
                <path
                  d="M772.68 557.38h23.38v-49.25c0-11.13 6.65-18.82 17.14-18.82 10.5 0 15.78 6.4 15.78 17.62v50.45h23.38v-55.34c0-20.1-10.73-32.1-29.79-32.1-13.21 0-22.26 6.24-26.83 16.89h-.48v-15.3h-22.58v85.85Z"
                  fill="url(#keystone)"
                />
                <path
                  d="M905.7 486.99c10.4 0 17.53 7.52 18 18.5h-36.43c.8-10.74 8.17-18.5 18.42-18.5Zm18.33 44.12c-2.16 6.57-8.73 10.81-17.3 10.81-11.93 0-19.7-8.4-19.7-20.66v-1.44h59.18v-7.13c0-26.1-15.77-43-40.76-43-25.38 0-41.4 17.78-41.4 45.16 0 27.47 15.86 44.37 42.28 44.37 21.22 0 36.6-11.3 39.16-28.11h-21.46Z"
                  fill="url(#keystone)"
                />
                <path
                  d="M1037.98 560.02c25.87 0 44.36-17.06 44.36-40.84 0-21.94-16.25-38.12-38.19-38.12-14.74 0-26.11 7.53-30.75 18.82h-.48c-.56-26.1 9.2-41.56 25.3-41.56 9.05 0 16.5 5.12 18.82 12.81h23.78c-3.2-18.9-20.42-31.95-42.44-31.95-29.87 0-48.45 23.06-48.45 61.34 0 15.38 3.29 28.43 9.7 38.2 8.08 13.77 21.77 21.3 38.35 21.3Zm-.24-19.3a20.83 20.83 0 0 1-21.06-21.06c0-11.7 9.13-20.42 21.14-20.42 12.09 0 20.98 8.73 20.98 20.66 0 11.61-9.29 20.82-21.06 20.82Z"
                  fill="url(#keystone)"
                />
              </g>
              <g filter="url(#n)">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M597.21 142.33a42.49 42.49 0 0 0-42.47 42.5V326.5a42.49 42.49 0 0 0 42.47 42.5H738.8a42.49 42.49 0 0 0 42.47-42.5V184.83a42.49 42.49 0 0 0-42.47-42.5H597.2Zm51.63 139.68v33.87h-30.45V196.1h30.45v51.46h1.57l39.82-51.47h32.68l-41.39 52.88 43.8 66.9h-35.75l-30.2-47.23-10.53 13.37Z"
                  fill="url(#logo)"
                />
              </g>
            </g>
            <defs>
              <linearGradient
                id="bg"
                x1="0"
                y1="0"
                x2="1336"
                y2="752"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="hsl(218, 100%, 10%)" />
                <stop offset="1" stopColor="hsl(218, 100%, 10%)" />
              </linearGradient>
              <linearGradient
                id="keystone"
                x1="628"
                y1="416.32"
                x2="628"
                y2="578.07"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="hsl(215, 100%, 50%)">
                  <animate
                    attributeName="stopColor"
                    values="hsl(215, 100%, 50%);hsl(193, 100%, 35%);hsl(215, 100%, 50%)"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="1" stopColor="hsl(193, 99%, 50%)">
                  <animate
                    attributeName="stopColor"
                    values="hsl(203, 99%, 50%);hsl(168, 99%, 75%);hsl(203, 99%, 50%)"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </stop>
              </linearGradient>
              <linearGradient
                id="logo"
                x1="629.5"
                y1="102.94"
                x2="629.48"
                y2="392.42"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="hsl(215, 100%, 50%)">
                  <animate
                    attributeName="stopColor"
                    values="hsl(215, 100%, 50%);hsl(193, 100%, 35%);hsl(215, 100%, 50%)"
                    dur="2s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keyTimes="0;1"
                    keySplines="0.1,1 0.9,0"
                  />
                </stop>
                <stop offset="1" stopColor="#01C7FE">
                  <animate
                    attributeName="stopColor"
                    values="hsl(203, 99%, 50%);hsl(168, 99%, 75%);hsl(203, 99%, 50%)"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </stop>
              </linearGradient>
              <radialGradient
                id="blob"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="rotate(-.29 202658.6 -129784.35) scale(861.614 640.89)"
              >
                <stop stopColor="hsl(215, 100%, 49%)" />
                <stop offset=".19" stopColor="hsl(215, 100%, 40%)" stopOpacity=".95" />
                <stop offset="1" stopColor="hsl(215, 100%, 36%)" stopOpacity="0" />
              </radialGradient>

              <filter
                id="b"
                x="-412.39"
                y="349.32"
                width="2160.78"
                height="1188.05"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="48" result="effect1_foregroundBlur_2247_58141" />
              </filter>
              <filter
                id="d"
                x="117.86"
                y="331.18"
                width="1104.48"
                height="429.99"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="32" />
                <feGaussianBlur stdDeviation="70" />
                <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.85 0" />
                <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_2247_58141" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow_2247_58141" result="shape" />
              </filter>
              <filter
                id="n"
                x="515.07"
                y="127.32"
                width="305.86"
                height="306.01"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feMorphology
                  radius="8.58"
                  in="SourceAlpha"
                  result="effect1_dropShadow_2247_58141"
                />
                <feOffset dy="24.66" />
                <feGaussianBlur stdDeviation="24.13" />
                <feColorMatrix values="0 0 0 0 0.043486 0 0 0 0 0.226735 0 0 0 0 0.545804 0 0 0 0.24 0" />
                <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_2247_58141" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow_2247_58141" result="shape" />
              </filter>

              <clipPath id="a">
                <path fill="#fff" d="M0 0h1336v751.5H0z" />
              </clipPath>
            </defs>
          </svg>
          Keystone 6 is now in General Availability! Today’s Keystone is faster and more flexible
          than it’s ever been, and is ready for you to build amazing things with{' '}
          <Emoji symbol="🚀" alt="Rocket" />{' '}
          <a href="/updates/general-availability">Read the full story here</a>.
        </Box>
        <Timeline date="24th November 2021" />
        <Box heading="Improved performance with Prisma’s Node Engine">
          Keystone now uses Prisma’s Node-API Query Engine. Query times are now much faster,
          especially for large data sets.
        </Box>
        <Timeline date="23rd November 2021" />
        <Box heading="Keystone Brand Portal">
          We now have a <a href="/branding">brand portal</a> full of logos, monograms and assets.
          Perfect for your blog posts, plugins and more.
        </Box>
        <Timeline date="15th November 2021" />
        <Box heading="New example: Nexus">
          <a
            href="https://github.com/keystonejs/keystone/tree/main/examples/extend-graphql-schema-nexus"
            target="_blank"
            rel="noopener noreferrer"
          >
            This example
          </a>{' '}
          uses{' '}
          <a href="https://nexusjs.org/" target="_blank" rel="noopener noreferrer">
            Nexus
          </a>{' '}
          — a declarative, code-first and strongly typed GraphQL schema construction for TypeScript
          & JavaScript —to extend the GraphQL API provided by Keystone with custom queries and
          mutations.
        </Box>
        <Timeline date="15th November 2021" />
        <Box heading="Expanded Unique Filters" link="releases/2021-11-15#expanded-unique-filters">
          <InlineCode>select</InlineCode>, <InlineCode>timestamp</InlineCode>,{' '}
          <InlineCode>float</InlineCode> and <InlineCode>decimal</InlineCode> fields with{' '}
          <InlineCode>isIndexed: 'unique'</InlineCode> now have unique filters via
          <InlineCode>ListWhereUniqueInput</InlineCode>.
        </Box>
        <Timeline date="15th November 2021" />
        <Box
          heading="Customisable Table & Column Names"
          link="/releases/2021-11-15#customisable-table-and-column-names"
        >
          You can now use different table and column names for your list and field keys. Powered by
          Prisma's <InlineCode>@map</InlineCode> and <InlineCode>@@map</InlineCode> attributes: this
          is useful if you don’t want to modify your existing database (such as a read-only
          database) and use it with Keystone.
        </Box>
        <Timeline date="2nd November 2021" />
        <Box heading="Server-side reloading" link="/releases/2021-11-02#server-side-live-reloading">
          With <InlineCode>keystone-next dev</InlineCode> you can now update your GraphQL schema,
          change hooks and access control, log errors to see how your data returns, then immediately
          use the playground to test it and iterate. This is on top of to the current support for
          live reloading changes to custom views in the Admin UI.
        </Box>
        <Timeline date="13th October 2021" />
        <Box heading="New deployment example: Microsoft Azure">
          <a
            href="https://github.com/aaronpowell/keystone-6-azure-example"
            target="_blank"
            rel="noopener noreferrer"
          >
            This example
          </a>{' '}
          shows you how to deploy Keystone to Azure PaaS using AppService, Storage and Postgres.
          Thanks to community member Aaron Powell for the awesome contribution{' '}
          <Emoji symbol="🙌" alt="Raised hands" />
        </Box>
        <Timeline date="5th October 2021" />
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
          , and a better mobile experience. We hope you like it <Emoji symbol="❤️" alt="Love" />
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
