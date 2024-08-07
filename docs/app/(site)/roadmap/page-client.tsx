/** @jsxImportSource @emotion/react */

'use client'

import Link from 'next/link'

import { useMediaQuery } from '../../../lib/media'
import { IntroWrapper, IntroHeading, IntroLead } from '../../../components/content/Intro'
import { Highlight } from '../../../components/primitives/Highlight'
import { MWrapper } from '../../../components/content/MWrapper'
import { Type } from '../../../components/primitives/Type'
import { Page } from '../../../components/Page'
import { EndCta } from '../../../components/content/EndCta'
import { Alert } from '../../../components/primitives/Alert'
import { Emoji } from '../../../components/primitives/Emoji'
import { Fragment, type ComponentProps, type ReactNode } from 'react'
import { Gradient } from '../../../components/primitives/Gradient'
import { InlineCode } from '../../../components/primitives/Code'
import { Tick } from '../../../components/icons'

function TimelineItem ({ children }: { children: ReactNode }) {
  return (
    <div
      css={{
        position: 'relative',
      }}
    >
      {children}
    </div>
  )
}

function TimelineMarker ({ look }: Pick<ComponentProps<typeof Gradient>, 'look'>) {
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
  )
}

function TimelineWeAreHere () {
  const arrowSize = '0.4rem'
  const mq = useMediaQuery()
  return (
    <span
      css={mq({
        position: ['relative', null, null, 'absolute'],
        margin: ['1rem 0', null, null, '-3rem 0 0'],
        left: ['7rem', null, null, null],
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
  )
}

type TimelineContentProps = {
  title: ReactNode
  children: ReactNode
} & Pick<ComponentProps<typeof Highlight>, 'look'>

function TimelineContent ({ title, look, children }: TimelineContentProps) {
  return (
    <div css={{ height: '100%' }}>
      <Type as="h3" look="heading20bold" margin="1rem 0">
        <Highlight look={look}>{title}</Highlight>
      </Type>
      <Type as="p" look="body16" css={{ display: 'block', marginRight: '1rem' }}>
        {children}
      </Type>
    </div>
  )
}

type RoadmapListProps = {
  children: ReactNode
}

function RoadmapList ({ children }: RoadmapListProps) {
  const mq = useMediaQuery()
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
  )
}

const roadmapItemSectionStyles = {
  margin: '0rem 0 .75rem',
  borderRadius: '.4rem',
  display: 'inline-block',
  padding: '0.1825rem 0.5rem',
  fontSize: '0.9rem',
  fontWeight: 700,
}

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
}

type RoadmapItemProps = {
  title: ReactNode
  section?: keyof typeof roadmapItemSection
  isReleased?: boolean
  children: ReactNode
}

function RoadmapItem ({ title, section, isReleased = false, children }: RoadmapItemProps) {
  const Section = section ? roadmapItemSection[section] : null
  return (
    <li css={{ position: 'relative' }}>
      {isReleased && (
        <Tick
          grad="grad2"
          css={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '2rem',
            height: '2rem',
          }}
        />
      )}
      {Section && <Section />}
      <Type as="h3" look="heading20bold" margin="0">
        {title}
      </Type>
      <Type as="p" look="body16" margin=".75rem 0">
        {children}
      </Type>
    </li>
  )
}

function Divider () {
  return (
    <hr
      css={{
        margin: '3rem 0',
        border: 'none',
        height: '1px',
        backgroundColor: 'var(--border)',
      }}
    />
  )
}

export default function Roadmap () {
  const mq = useMediaQuery()

  return (
    <Page>
      <MWrapper>
        <IntroWrapper>
          <IntroHeading>
            The Keystone <Highlight look="grad1">Roadmap</Highlight>
          </IntroHeading>
          <IntroLead>
            Keystone 6 is actively maintained and steadily improving. We've graduated to the{' '}
            <InlineCode>@keystone-6</InlineCode> namespace on npm and have a stable set of APIs that
            you can confidently build on 🚀
          </IntroLead>
        </IntroWrapper>
        <Alert look="tip" css={{ marginTop: '2rem' }}>
          <span
            css={{
              display: 'inline-block',
              margin: '0.5rem 0.8rem 0.5rem 0',
            }}
          >
            To see what we've recently shipped, checkout our <Link href="/releases">release notes</Link> <Emoji symbol="🚀" alt="Rocket" />
          </span>
        </Alert>

        <div
          css={mq({
            marginTop: ['3rem', '3rem', '5rem', '8em'],
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
              Published the <strong>New Interfaces</strong> as{' '}
              <InlineCode>@keystone-next</InlineCode>
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
        <Type as="h2" look="heading48" css={{ marginTop: '4rem' }}>
          What's <Highlight look="grad1">up next</Highlight>
        </Type>
        <Type as="p" look="body18" margin="1rem 0">
          We're using the foundations we shipped in 2021 as a springboard to bring{' '}
          <Link href="/for-developers">developers</Link>,{' '}
          <Link href="/for-organisations">project owners</Link>, and{' '}
          <Link href="/for-content-management">editors</Link> into more productive ways of working
          together. Our key areas of focus are:
        </Type>
        <div className="prose" css={{ li: { fontSize: '1.125rem' } }}>
          <ul>
            <li>
              <strong>Schema-driven auth</strong> that streamlines how users authenticate with
              Keystone applications
            </li>
            <li>
              <strong>A next-gen Admin UI</strong> that unifies developer and editor collaborations
              in new and exciting ways
            </li>
            <li>
              <strong>Maturing the DX</strong> with better Types and capabilities for self-hosting
              and media management
            </li>
          </ul>
        </div>
        <Type as="h3" look="heading20bold" margin="2rem  0 1rem">
          Schema-driven authentication
        </Type>
        <Type as="p" look="body18">
          Keystone operates on the schema-driven principle. Right now, authentication in Keystone is
          left up to the developers to implement. This leads to every Keystone project having auth
          handled in a slightly different way.
        </Type>
        <Type as="p" look="body18" margin="1rem 0">
          We want to change that and offer a predictable, schema-driven first-party authentication
          solution for Keystone.
        </Type>
        <Type as="h3" look="heading20bold" margin="2rem 0 1rem">
          Next-gen Admin UI
        </Type>
        <Type as="p" look="body18">
          Our design and labs teams have re-imagined a state-of-the-art Admin UI. One that is
          responsive, accessible and functional. The fruit of this work led to{' '}
          <a href="https://github.com/Thinkmill/keystatic/tree/main/design-system">Keystar UI</a>,
          an internal design system we've been battle-testing with{' '}
          <a href="https://keystatic.com">Keystatic</a>.
        </Type>

        <Type as="p" look="body18" margin="1rem 0">
          This body of work will elevate the experience of authoring content in Keystone to the same
          high standards we have for authoring with Keystone's core APIs.
        </Type>
        <Type as="h3" look="heading20bold" margin="2rem 0 1rem">
          Maturing the Developer Experience
        </Type>
        <Type as="p" look="body18">
          At{' '}
          <a href="https://thinkmill.com.au" target="_blank" rel="noreferrer">
            Thinkmill
          </a>
          , we have a longstanding commitment to open source that includes the likes of{' '}
          <a href="https://react-select.com" target="_blank" rel="noreferrer">
            react select
          </a>
          ,{' '}
          <a href="https://github.com/JedWatson/classnames" target="_blank" rel="noreferrer">
            classnames
          </a>
          ,{' '}
          <a href="https://keystatic.com" target="_blank" rel="noreferrer">
            Keystatic
          </a>
          , and of course Keystone.
        </Type>
        <Type as="p" look="body18" margin="1rem 0">
          We'll continue to iterate on this knowledge and learning loop to make Keystone the easiest
          way to design and standup a GraphQL API on the web. Going all-in on Typescript has made
          the DX so sweet, but we want to take it <em>further</em> so that Keystone's the best
          Typescript &gt; GraphQL developer experience in the ecosystem.{' '}
          <Emoji symbol="✨" alt="Sparkles" />
        </Type>
        <Type as="p" look="body18" margin="1rem 0">
          We'll also focus on making better pathways for you to integrate Keystone with the
          deployment services you use most, so you can get the most out of where the modern web is
          going. Image and file management is an area we're actively iterating on, and we'll have
          more to share soon.
        </Type>

        <Type as="h2" look="heading48" css={{ marginTop: '4rem' }}>
          <Highlight look="grad1">Feature</Highlight> roadmap
        </Type>

        <Type as="p" look="body18" margin="1rem 0">
          Here's what we've been working on, and what's coming next.
        </Type>

        <Type as="h3" look="heading30" css={{ marginTop: '2rem' }}>
          Recently released
        </Type>
        <RoadmapList>
          <RoadmapItem title="Singletons" section="fields and schema" isReleased>
            <Fragment>
              A way to define a single object in schema that's editable in Admin UI and accessible
              in the GraphQL API. Handy for storing website & social settings, API keys, and{' '}
              <Link href="/blog/singleton">more</Link>.
            </Fragment>
          </RoadmapItem>
          <RoadmapItem title="Field Groups" section="admin ui" isReleased>
            <Fragment>
              It's often easier to work with content when the form is grouped into different
              sections of related fields. <Link href="/docs/fields/overview#groups">Learn more</Link>
            </Fragment>
          </RoadmapItem>
          <RoadmapItem title="Back-end APIs for Node.js apps" section="core" isReleased>
            <Fragment>
              Access your GraphQL APIs from Node.js for greater flexibility when writing apps and
              hybrid use-cases.
            </Fragment>
          </RoadmapItem>
        </RoadmapList>
        <Divider />

        <Type as="h3" look="heading30" css={{ marginTop: '2rem' }}>
          Current focus
        </Type>
        <RoadmapList>
          <RoadmapItem title="Conditional fields" section="fields and schema">
            <Fragment>
              Dynamically showing fields based on the value of other fields is a great way to
              improve editing flow and content integrity.
            </Fragment>
          </RoadmapItem>
          <RoadmapItem title="Next-gen Admin UI" section="admin ui">
            <Fragment>
              Make the Admin UI responsive, accessible and i18n compliant with the battle-tested{' '}
              <a href="https://github.com/Thinkmill/keystatic/tree/main/design-system">
                Keystar UI
              </a>{' '}
              design system.
            </Fragment>
          </RoadmapItem>
        </RoadmapList>
        <Divider />
        <Type as="h3" look="heading30">
          Next up
        </Type>
        <RoadmapList>
          <RoadmapItem title="Nested fields" section="fields and schema">
            <Fragment>
              Sometimes you need to manage data in structures that are nested and/or repeating.
              We're working on a way to define these in schema and have them stored as JSON field in
              the database.
            </Fragment>
          </RoadmapItem>
          <RoadmapItem title="Sortable lists" section="core">
            <Fragment>
              Certain list types come with a need to order the items they contain. We're looking in
              to an approach that's easy to implement in schema.
            </Fragment>
          </RoadmapItem>
          <RoadmapItem title="Build & Deployment options" section="docs">
            <Fragment>
              We're broadening our list of streamlined scenarios & looking into options for
              serverless environments.
            </Fragment>
          </RoadmapItem>
        </RoadmapList>
        <Divider />
        <Type as="h3" look="heading30" margin="1rem 0 2rem">
          Further afield
        </Type>
        <RoadmapList>
          <RoadmapItem title="Content preview" section="admin ui">
            <Fragment>
              Built-in tooling for you to give editors a sense of how their content will be consumed
              by end users.
            </Fragment>
          </RoadmapItem>
          <RoadmapItem title="Custom publishing workflows" section="admin ui">
            <Fragment>
              Design your own journey from <InlineCode>draft</InlineCode> to{' '}
              <InlineCode>published</InlineCode> to meet the unique needs of your content team.
            </Fragment>
          </RoadmapItem>
          <RoadmapItem title="Relationship management" section="admin ui">
            <Fragment>
              More powerful interfaces for managing different scales of related data, from small to
              really really large
            </Fragment>
          </RoadmapItem>
          <RoadmapItem title="GraphQL Subscriptions" section="core">
            <Fragment>
              Long lasting server operations that can change their result over time. Handy for
              updating your front-end in real time when important data changes in your backend.
            </Fragment>
          </RoadmapItem>
          <RoadmapItem title="Field Translations" section="core">
            <Fragment>
              A built-in schema-driven approach to supporting multilingual content projects.
            </Fragment>
          </RoadmapItem>
          <RoadmapItem title="Upsert mutations" section="core">
            <Fragment>
              If you want to update an item but aren't sure if it exists, this will update the item
              if it's there or create a new item with the data you've provided.
            </Fragment>
          </RoadmapItem>
          <RoadmapItem title="Serverless hosting" section="core">
            <Fragment>
              The future of deployment is serverless, and we're tracking the state of the ecosystem
              to make sure Keystone is ready for it.
            </Fragment>
          </RoadmapItem>
          <RoadmapItem title="Native full-text search" section="core">
            <Fragment>
              A way for you and editors to easily search for strings across your entire dataset.
              Handy for when you need something specific but don't know where it lives.
            </Fragment>
          </RoadmapItem>
        </RoadmapList>
        <Alert look="tip" css={{ margin: '2rem 0 2rem' }}>
          <Type as="p">
            <strong>Got a feature you're after, or want to know more about the future?</strong>
          </Type>
          <Type as="p" margin=".5rem 0 0">
            Join the Keystone conversation on{' '}
            <a href="https://community.keystonejs.com" target="_blank" rel="noreferrer">
              Slack
            </a>
            ,{' '}
            <a
              href="https://github.com/keystonejs/keystone/discussions"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            , and{' '}
            <a href="https://twitter.com/keystonejs" target="_blank" rel="noreferrer">
              Twitter
            </a>
            .
          </Type>
        </Alert>
        <EndCta grad="grad1" />
      </MWrapper>
    </Page>
  )
}
