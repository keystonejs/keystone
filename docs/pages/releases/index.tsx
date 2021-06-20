/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { getServerSideProps } from '../../components/Markdown';
import { InlineCode } from '../../components/primitives/Code';
import { Alert } from '../../components/primitives/Alert';
import { Emoji } from '../../components/primitives/Emoji';
import { Type } from '../../components/primitives/Type';
import { DocsPage } from '../../components/Page';
import { useMediaQuery } from '../../lib/media';

function Timeline({ date, isLatest, isFirst, ...props }) {
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

function Box({ link, heading, children, ...props }) {
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
      <Type as="p" look="body18">
        {children}
      </Type>
      {link && (
        <Link href={link} passHref>
          <a css={{ display: 'block' }}>read more</a>
        </Link>
      )}
    </Type>
  );
}

export default function WhatsNew(props) {
  const mq = useMediaQuery();

  return (
    <DocsPage noRightNav noProse {...props}>
      <Type as="h1" look="heading48">
        What's new in Keystone 6
      </Type>

      <Type as="p" look="body18" margin="1rem 0">
        In this major update, we've focused on improving Keystone's <strong>interfaces</strong>,
        including the way you configure and run Keystone projects, and a whole new Admin UI.
      </Type>
      <Type as="p" look="body18" margin="1rem 0">
        We're also adding powerful new features to make Keystone the best headless content
        management system around, especially when you're using a component-based front-end like
        React and Vue.
      </Type>

      <Type as="h2" look="heading24" margin="1rem 0">
        Milestones
      </Type>

      <Alert look="neutral" css={{ margin: '3rem 0' }}>
        There’s much more to come too! Check out our{' '}
        <Link href="/updates/roadmap">
          <a>roadmap</a>
        </Link>
      </Alert>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['8.25rem auto', null, null, '12.5rem auto', '18rem auto'],
          gap: 0,
        })}
      >
        <Timeline date="15th June 2021" isLatest />
        <Box link="/releases/2021-06-15" heading="TODO">
          Keystone Next now has a new core <Emoji symbol="🤖" alt="Robot" />, unblocking many of the
          features you’ve been waiting for!
        </Box>
        <Timeline date="2nd June 2021" />
        <Box link="/releases/2021-06-02" heading="TODO">
          We have a new JSON field <Emoji symbol="✨" alt="Sparkle" />, a bunch of new learning
          resources, and plenty of under the hood optimisations in this big release.{' '}
          <Emoji symbol="💪" alt="Strong" />
        </Box>
        <Timeline date="19th May 2021" />
        <Box link="/releases/2021-05-19" heading="TODO">
          Node updates and Admin UI has moved! <Emoji symbol="🚚" alt="Truck" />
        </Box>
        <Timeline date="17th May 2021" />
        <Box link="/releases/2021-05-17" heading="TODO">
          Apollo caching can now be configured for performance <Emoji symbol="🔥" alt="Fire" /> and
          a basic authentication example to get your started <Emoji symbol="🔒" alt="Lock" />
        </Box>
        <Timeline date="11th May 2021" />
        <Box link="/releases/2021-05-11" heading="TODO">
          A bunch of admin UI tweaks in this release <Emoji symbol="🖥️" alt="Monitor" />, among
          other minor fixes
        </Box>
        <Timeline date="5th May 2021" />
        <Box link="/releases/2021-05-05" heading="TODO">
          Aside from dependency updates <Emoji symbol="😴" alt="Tired" />, we added an{' '}
          <InlineCode>isIndexed</InlineCode>
          config option to the <InlineCode>text</InlineCode>, <InlineCode>integer</InlineCode>,{' '}
          <InlineCode>float</InlineCode>, <InlineCode>select</InlineCode>, and{' '}
          <InlineCode>timestamp</InlineCode> field types
        </Box>
        <Timeline date="3rd May 2021" />
        <Box link="/releases/2021-05-03" heading="TODO">
          Files in Keystone 6 <Emoji symbol="📁" alt="Folder" />! This release involved a bunch of
          busywork behind the scenes in Keystone 6 <Emoji symbol="🔧" alt="Working tools" />
        </Box>
        <Timeline date="20th April 2021" />
        <Box link="/releases/2021-04-20" heading="TODO">
          Improvements to the Lists API, deprecating <InlineCode>resolveFields</InlineCode>{' '}
          <Emoji symbol="🔧" alt="Working tool" />
        </Box>
        <Timeline date="6th April 2021" />
        <Box link="/releases/2021-04-06" heading="TODO">
          Controlled code demolition 🏗️ 👷‍♀️, Better pagination in Admin UI{' '}
          <Emoji symbol="⏭️" alt="Fast forward" />
        </Box>
        <Timeline date="30th March 2021" />
        <Box link="/releases/2021-03-30" heading="TODO">
          Goodbye legacy code <Emoji symbol="👋" alt="Waving" />{' '}
          <Emoji symbol="🌇" alt="Postcard" />, Improved <InlineCode>select</InlineCode> field type{' '}
          <Emoji symbol="🔽" alt="Selector" />, Squashed bugs <Emoji symbol="🐛" alt="Bug" />
        </Box>
        <Timeline date="23rd March 2021" />
        <Box link="/releases/2021-03-23" heading="TODO">
          Added support for SQLite with Prisma <Emoji symbol="🎉" alt="Celebration" />, Noteworthy
          bug-squashing <Emoji symbol="🐛" alt="Bug" />
        </Box>
        <Timeline date="22nd March 2021" isFirst />
        <Box link="/releases/2021-03-22" heading="TODO">
          Prisma migrations <Emoji symbol="🚚" alt="Truck" />, Noteworthy bug-squashing{' '}
          <Emoji symbol="🐛" alt="Bug" />
        </Box>
      </div>

      <Alert look="tip" css={{ margin: '1rem 0' }}>
        <Emoji symbol="🔎" alt="Magnifying Glass" /> You can also find all{' '}
        <strong>Keystone 6</strong> releases on{' '}
        <a
          href="https://github.com/keystonejs/keystone/releases"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </Alert>
    </DocsPage>
  );
}

export { getServerSideProps };
