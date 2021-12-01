/** @jsxRuntime classic */
/** @jsx jsx  */
import { ComponentProps, Fragment, ReactNode } from 'react';
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { getStaticProps } from '../../components/Markdown';
import { InlineCode } from '../../components/primitives/Code';
import { Highlight } from '../../components/primitives/Highlight';
import { Gradient } from '../../components/primitives/Gradient';
import { Alert } from '../../components/primitives/Alert';
import { Emoji } from '../../components/primitives/Emoji';
import { Type } from '../../components/primitives/Type';
import { DocsPage } from '../../components/Page';
import { useMediaQuery } from '../../lib/media';

function TimelineItem({ children }: { children: ReactNode }) {
  return (
    <div
      css={{
        position: 'relative',
      }}
    >
      {children}
    </div>
  );
}

function TimelineMarker({ look }: Pick<ComponentProps<typeof Gradient>, 'look'>) {
  return (
    <div
      css={{
        display: 'grid',
        gridTemplateColumns: 'max-content auto',
        alignItems: 'center',
        gap: '0.5em',
        height: '1em',
      }}
    >
      <Gradient
        as="div"
        look={look}
        css={{
          borderRadius: 99,
          width: '0.8em',
          height: '0.8em',
        }}
      />
      <div
        css={{
          borderTop: '1px dashed var(--muted)',
          opacity: 0.5,
          height: 0,
        }}
      />
    </div>
  );
}

function TimelineWeAreHere() {
  const arrowSize = '0.4rem';
  const mq = useMediaQuery();
  return (
    <span
      css={mq({
        position: ['relative', null, null, 'absolute'],
        margin: ['1rem 0', null, null, '-3rem 0 0'],
        left: ['-0.75rem', null, null, null],
        display: 'inline-block',
        borderRadius: '0.4rem',
        backgroundColor: 'var(--text)',
        color: 'var(--app-bg)',
        padding: '0.4rem 0.6rem',
        fontSize: '0.9rem',
        fontWeight: 'bold',
      })}
    >
      <span
        css={mq({
          position: 'absolute',
          border: `${arrowSize} solid var(--text)`,
          borderColor: 'var(--text) transparent transparent transparent',
          top: '100%',
          left: ['0.75rem', null, null, null],
          height: arrowSize,
          width: arrowSize,
        })}
      />
      We are here! <Emoji symbol="👋" alt="Hand waving" />
    </span>
  );
}

type TimelineContentProps = {
  title: ReactNode;
  children: ReactNode;
} & Pick<ComponentProps<typeof Highlight>, 'look'>;
function TimelineContent({ title, look, children }: TimelineContentProps) {
  return (
    <div css={{ height: '100%' }}>
      <Type as="h3" look="heading20bold" margin="1rem 0">
        <Highlight look={look}>{title}</Highlight>
      </Type>
      <Type as="p" look="body16" css={{ display: 'block', marginRight: '1rem' }}>
        {children}
      </Type>
    </div>
  );
}

type RoadmapListProps = {
  children: ReactNode;
};

function RoadmapList({ children }: RoadmapListProps) {
  const mq = useMediaQuery();
  return (
    <ul
      css={mq({
        listStyle: 'none',
        margin: '2rem 0 3rem 0',
        padding: 0,
        display: 'grid',
        gridTemplateColumns: ['1fr', '1fr 1fr', null, '1fr 1fr 1fr 1fr'],
        gap: '2rem',
      })}
    >
      {children}
    </ul>
  );
}

const roadmapItemSectionStyles = {
  margin: '0rem 0 .75rem',
  borderRadius: '.4rem',
  display: 'inline-block',
  padding: '0.1825rem 0.5rem',
  fontSize: '0.9rem',
  fontWeight: 700,
};
const roadmapItemSection = {
  docs: () => (
    <span css={{ ...roadmapItemSectionStyles, background: '#f1f3f5', color: '#495057' }}>Docs</span>
  ),
  'fields and schema': () => (
    <span css={{ ...roadmapItemSectionStyles, background: '#fff0f6', color: '#a61e4d' }}>
      Fields & Schema
    </span>
  ),
  core: () => (
    <span css={{ ...roadmapItemSectionStyles, background: '#f3f0ff', color: '#5f3dc4' }}>Core</span>
  ),
  'admin ui': () => (
    <span css={{ ...roadmapItemSectionStyles, background: '#e7f5ff', color: '#1864ab' }}>
      Admin UI
    </span>
  ),
};

type RoadmapItemProps = {
  title: ReactNode;
  section?: keyof typeof roadmapItemSection;
  children: ReactNode;
};
function RoadmapItem({ title, section, children }: RoadmapItemProps) {
  const Section = section ? roadmapItemSection[section] : null;
  return (
    <li>
      {Section && <Section />}
      <Type as="h3" look="heading20bold" margin="0">
        {title}
      </Type>
      <Type as="p" look="body16" margin=".75rem 0">
        {children}
      </Type>
    </li>
  );
}

function Divider() {
  return (
    <hr
      css={{
        margin: '3rem 0',
        border: 'none',
        height: '1px',
        backgroundColor: 'var(--border)',
      }}
    />
  );
}

export default function Roadmap() {
  const mq = useMediaQuery();

  return (
    <DocsPage
      noRightNav
      noProse
      title={'Roadmap'}
      description={'Discover where KeystoneJS is headed, and why we’re going there.'}
    >
      <Type as="h1" look="heading64">
        Roadmap
      </Type>
      <Type as="p" look="body18" margin="1rem 0">
        After a year of intensive development Keystone 6 has achieved a{' '}
        <Link href="/updates/general-availability">General Availability release</Link>! We’ve
        graduated to the
        <InlineCode>@keystone-6</InlineCode> namespace on npm and have a stable set of APIs that you
        can confidently build on <Emoji symbol="🚀" alt="Rocket" />
      </Type>
      <div
        css={mq({
          marginTop: '4em',
          display: 'grid',
          gridTemplateColumns: ['1fr', null, null, '1fr 1fr 1fr 1fr'],
          gap: '1rem',
        })}
      >
        <TimelineItem>
          <TimelineMarker look="grad2" />
          <TimelineContent title="Research & Development" look="grad2">
            Surveyed the landscape. Formed concepts around what a next-gen experience would look
            like. Started laying the foundations.
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineMarker look="grad2" />
          <TimelineContent title="Community Preview" look="grad2">
            Published the <strong>New Interfaces</strong> as <InlineCode>@keystone-next</InlineCode>
            on npm. Commenced iteration based on community & internal feedback.
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineWeAreHere />
          <TimelineMarker look="grad2" />
          <TimelineContent title="General Availability Release" look="grad2">
            Stabilised the new architecture & APIs. Docs & example projects. Published as{' '}
            <InlineCode>@keystone-6</InlineCode> on npm.
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineMarker look="grad1" />
          <TimelineContent title="Maturity, community, & next-gen Admin UI" look="grad1">
            A better dev-configured editing experience. Maturity & features in Keystone core. More
            pathways to grow with Keystone.
          </TimelineContent>
        </TimelineItem>
      </div>
      <Type as="h2" look="heading36" css={{ margin: '2rem 0 0' }}>
        What's Next
      </Type>
      <Type as="p" look="body18" margin="1rem 0">
        We’re using the foundations we shipped in 2021 as a springboard to bring{' '}
        <Link href="/for-developers" passHref>
          <a>developers</a>
        </Link>
        ,{' '}
        <Link href="/for-organisations" passHref>
          <a>project owners</a>
        </Link>
        , and{' '}
        <Link href="/for-content-management" passHref>
          <a>editors</a>
        </Link>{' '}
        into more productive ways of working together. Our key areas of focus for 2022 are:
      </Type>
      <div className="prose" css={{ li: { fontSize: '1.125rem' } }}>
        <ul>
          <li>
            <strong>A next-gen Admin UI</strong> that unifies developer and editor collaborations in
            new and exciting ways
          </li>
          <li>
            <strong>Maturing the DX</strong> with better Types and capabilities for self-hosting and
            media management
          </li>
          <li>
            <strong>Enabling community</strong> with more pathways for you to learn and grow with
            Keystone
          </li>
        </ul>
      </div>
      <Type as="h3" look="heading20bold" margin="2rem 0 1rem">
        Next-gen Admin UI
      </Type>
      <Type as="p" look="body18">
        Our design team spent much of the second half of 2021 defining a new vision for Admin UI
        that gives you more capabilities to support content editors in ways that matter most to
        them. We’ve already shipped quick wins for customisable{' '}
        <Link href="/docs/guides/custom-admin-ui-logo" passHref>
          <a>logos</a>
        </Link>
        ,{' '}
        <Link href="/docs/guides/custom-admin-ui-pages" passHref>
          <a>pages</a>
        </Link>
        , and{' '}
        <Link href="/docs/guides/custom-admin-ui-navigation" passHref>
          <a>navigation</a>
        </Link>
        , but the really transformative features (that rely on more extensive customisation) are
        still in the works. This body of work will elevate the experience of authoring content in
        Keystone to the same high standards we have for authoring with Keystone’s core APIs.
      </Type>
      <Type as="h3" look="heading20bold" margin="1rem 0">
        Maturing the Developer Experience
      </Type>
      <Type as="p" look="body18">
        We’ll continue to iterate on making Keystone the easiest way to design and standup a GraphQL
        API on the web. Going all-in on Typescript has made the DX so sweet, but we want to take it{' '}
        <em>further</em> so that Keystone’s the best Typescript &gt; GraphQL developer experience in
        the ecosystem. <Emoji symbol="✨" alt="Sparkles" />
      </Type>
      <Type as="p" look="body18" margin="1rem 0">
        We’ll also focus on making better pathways for you to integrate Keystone with the deployment
        services you use most, so you can get the most out of where the modern web is going. Image
        and file management is an area we’re actively iterating on, and we’ll have more to share
        soon.
      </Type>
      <Type as="h3" look="heading20bold" margin="1rem 0">
        Enabling the community
      </Type>
      <Type as="p" look="body18" margin="1rem 0">
        At{' '}
        <a href="https://thinkmill.com.au" target="_blank" rel="noopener noreferrer">
          Thinkmill
        </a>
        , we have a longstanding commitment to open source that includes the likes of{' '}
        <a href="https://react-select.com" target="_blank" rel="noopener noreferrer">
          react select
        </a>
        ,{' '}
        <a href="https://github.com/JedWatson/classnames" target="_blank" rel="noopener noreferrer">
          classnames
        </a>
        , and of course Keystone <Emoji symbol="🙂" alt="Smile" />. Now that Keystone 6 is stable
        enough to develop features and integrations around, we’ll put better processes in place for
        you to collaborate around the Keystone project and showcase your awesome work with others in
        the community.
      </Type>
      <Type as="h2" look="heading36" css={{ margin: '2rem 0 0' }}>
        Feature Roadmap
      </Type>
      <Alert look="tip" css={{ margin: '2rem 0 2rem' }}>
        <span
          css={{
            display: 'inline-block',
            margin: '0.5rem 0.8rem 0.5rem 0',
          }}
        >
          To see what we’ve recently shipped, checkout our{' '}
          <Link href="/updates" passHref>
            <a>updates</a>
          </Link>{' '}
          and{' '}
          <Link href="/releases" passHref>
            <a>release notes</a>
          </Link>{' '}
          <Emoji symbol="🚀" alt="Rocket" />
        </span>
      </Alert>
      <Type as="h3" look="heading30">
        Currently iterating on
      </Type>
      <Type as="p" look="body18" margin="1rem 0 2rem">
        We have the foundations for these in place, and are working on making them better.
      </Type>
      <RoadmapList>
        <RoadmapItem title="Image & file management" section="fields and schema">
          <Fragment>
            We have the basics in place and are working towards more seamless end-to-end options.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="Back-end APIs for Node.js apps" section="core">
          <Fragment>
            Access your GraphQL APIs from Node.js for greater flexibility when writing apps and
            hybrid use-cases.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="Build & Deployment options" section="docs">
          <Fragment>
            We’re broadening our list of streamlined scenarios & looking into options for serverless
            environments.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="Onboarding series" section="docs">
          <Fragment>
            A step by step tutorial series that takes you from first principles through to a working
            local Keystone instance.
          </Fragment>
        </RoadmapItem>
      </RoadmapList>
      <Divider />
      <Type as="h3" look="heading30">
        Next up
      </Type>
      <RoadmapList>
        <RoadmapItem title=" Nested fields" section="fields and schema">
          <Fragment>
            Sometimes you need to manage data in structures that are nested and/or repeating. We’re
            working on a way to define these in schema and have them stored as JSON field in the
            database.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="Singletons" section="fields and schema">
          <Fragment>
            A way to define a single object in schema that’s editable in Admin UI and accessible in
            the GraphQL API. Handy for storing website & social settings, API keys, and more.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="  Sortable lists" section="core">
          <Fragment>
            Certain list types come with a need to order the items they contain. We’re looking in to
            an approach that’s easy to implement in schema.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="  Field Descriptions" section="admin ui">
          <Fragment>
            A way to give helpful context to your editors when they’re filling out fields. Makes
            their job easier and improves what goes into your database.
          </Fragment>
        </RoadmapItem>
      </RoadmapList>
      <Divider />
      <Type as="h3" look="heading30" margin="1rem 0 2rem">
        Further afield
      </Type>
      <Type as="h2" look="heading24">
        Admin UI
      </Type>
      <RoadmapList>
        <RoadmapItem title="Field Groups">
          <Fragment>
            It’s often easier to work with content when the form is grouped into different sections
            of related fields.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="Localisation">
          <Fragment>
            When an English-language UI doesn’t work for your team there’ll be a way for you to add
            translations to all the strings in Admin UI.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="Conditional fields">
          <Fragment>
            Dynamically showing fields based on the value of other fields is a great way to improve
            editing flow and content integrity.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="Responsive Layout">
          <Fragment>
            An editing interface that’s available for you to use no matter what device you’re on.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="A11y compliance">
          <Fragment>
            Solving accessibility in a customisable editing interface is a hard problem. We’re up
            for the challenge.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="Content preview ">
          <Fragment>
            Built-in tooling for you to give editors a sense of how their content will be consumed
            by end users.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="Non-destructive editing">
          <Fragment>
            Better safeguards for saving changes when you transition in and out of different editing
            contexts.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="Version history">
          <Fragment>
            Store content changes over time. Easy rollbacks to earlier versions if you make a
            mistake or change your mind.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="Custom publishing workflows">
          <Fragment>
            Design your own journey from <InlineCode>draft</InlineCode> to{' '}
            <InlineCode>published</InlineCode> to meet the unique needs of your content team.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="Relationship management">
          <Fragment>
            More powerful interfaces for managing different scales of related data, from small to
            really really large
          </Fragment>
        </RoadmapItem>
      </RoadmapList>
      <Type as="h2" look="heading24">
        Schema & API
      </Type>
      <RoadmapList>
        <RoadmapItem title="GraphQL Subscriptions">
          <Fragment>
            Long lasting server operations that can change their result over time. Handy for
            updating your front-end in real time when important data changes in your backend.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="Field Translations">
          <Fragment>
            A built-in schema-driven approach to supporting multilingual content projects.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="Upsert mutations">
          <Fragment>
            If you want to update an item but aren’t sure if it exists, this will update the item if
            it’s there or create a new item with the data you’ve provided.
          </Fragment>
        </RoadmapItem>
      </RoadmapList>
      <Type as="h2" look="heading24">
        Core
      </Type>
      <RoadmapList>
        <RoadmapItem title="Serverless hosting">
          <Fragment>
            The future of deployment is serverless, and we're tracking the state of the ecosystem to
            make sure Keystone is ready for it.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="Native full-text search">
          <Fragment>
            A way for you and editors to easily search for strings across your entire dataset. Handy
            for when you need something specific but don’t know where it lives.
          </Fragment>
        </RoadmapItem>
        <RoadmapItem title="MongoDB">
          <Fragment>
            Native support for the MongoDB database type. We’ll look at adding this when Prisma’s
            implementation of MongoDB is battle-tested.
          </Fragment>
        </RoadmapItem>
      </RoadmapList>
      <Alert look="tip" css={{ margin: '2rem 0 2rem' }}>
        <Type as="p">
          <strong>Got a feature you’re after, or want to know more about the future?</strong>
        </Type>
        <Type as="p" margin=".5rem 0 0">
          Join the Keystone conversation on{' '}
          <a href="https://community.keystonejs.com" target="_blank" rel="noopener noreferrer">
            Slack
          </a>
          ,{' '}
          <a
            href="https://github.com/keystonejs/keystone/discussions"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          , and{' '}
          <a href="https://twitter.com/keystonejs" target="_blank" rel="noopener noreferrer">
            Twitter
          </a>
          .
        </Type>
      </Alert>
    </DocsPage>
  );
}

export { getStaticProps };
