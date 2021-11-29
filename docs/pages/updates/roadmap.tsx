/** @jsxRuntime classic */
/** @jsx jsx  */
import { ComponentProps, Fragment, ReactNode } from 'react';
import { jsx } from '@emotion/react';

import { getStaticProps } from '../../components/Markdown';
import { InlineCode } from '../../components/primitives/Code';
import { Button } from '../../components/primitives/Button';
import { Highlight } from '../../components/primitives/Highlight';
import { Gradient } from '../../components/primitives/Gradient';
import { Alert } from '../../components/primitives/Alert';
import { Emoji } from '../../components/primitives/Emoji';
import { Type } from '../../components/primitives/Type';
import { ArrowR } from '../../components/icons/ArrowR';
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
        right: ['0.6rem', null, null, '1rem'],
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
          right: [undefined, null, null, '1rem'],
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

const roadmapItemStatusStyles = {
  margin: '1rem 0',
  borderRadius: '0.4rem',
  display: 'inline-block',
  padding: '0.3rem 0.6rem',
  fontSize: '0.9rem',
  fontWeight: 700,
};
const roadmapItemStatus = {
  'not started': () => (
    <span css={{ ...roadmapItemStatusStyles, background: '#f1f3f5', color: '#495057' }}>
      Not Started
    </span>
  ),
  'theres a plan': () => (
    <span css={{ ...roadmapItemStatusStyles, background: '#fff0f6', color: '#a61e4d' }}>
      There's a Plan
    </span>
  ),
  'figuring it out': () => (
    <span css={{ ...roadmapItemStatusStyles, background: '#f3f0ff', color: '#5f3dc4' }}>
      Figuring It Out
    </span>
  ),
  'making it happen': () => (
    <span css={{ ...roadmapItemStatusStyles, background: '#e7f5ff', color: '#1864ab' }}>
      Making It Happen
    </span>
  ),
  'wrapping it up': () => (
    <span css={{ ...roadmapItemStatusStyles, background: '#e6fcf5', color: '#087f5b' }}>
      Wrapping It Up
    </span>
  ),
};
type RoadmapItemProps = {
  title: ReactNode;
  status?: keyof typeof roadmapItemStatus;
  children: ReactNode;
};
function RoadmapItem({ title, status = 'not started', children }: RoadmapItemProps) {
  const Status = roadmapItemStatus[status];
  return (
    <Fragment>
      <Type as="h3" look="heading30" margin="2rem 0 0">
        {title}
      </Type>
      <Status />
      <Type as="div" look="body16" css={{ p: { margin: '0 0 1rem 0' } }}>
        {children}
      </Type>
    </Fragment>
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
        After a year of development, Keystone 6 is in the final stages of{' '}
        {/* <Highlight look="grad5" css={{ fontWeight: 700 }}>
          Community Preview
        </Highlight> */}
        <strong>Community Preview</strong>.
      </Type>

      <Type as="p" look="body18" margin="1rem 0">
        This means we're integrating feedback and tweaking our APIs before finalising our move from
        v5 to v6, and publishing packages under the <InlineCode>@keystone-6</InlineCode> scope on
        npm.
      </Type>

      <Type as="p" look="body18" margin="1rem 0">
        In <strong>Q3 2021</strong> we'll be moving Keystone 6 to{' '}
        {/* <Highlight css={{ fontWeight: 700 }}>General Availability</Highlight> */}
        <strong>General Availability</strong>, graduating to the{' '}
        <InlineCode>@keystone-6</InlineCode> namespace on npm, and will commit to a stable set of
        APIs for you to build on confidently.
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
          <TimelineContent title="Research" look="grad2">
            We started looking at what the next generation of cms platforms could look like, and how
            to dramatically improve Keystone's developer experience
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineMarker look="grad2" />
          <TimelineContent title="Development" look="grad2">
            Confident about our approach and the benefits, we started building the new interfaces
            around Keystone 5's core with Prisma and TypeScript
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineWeAreHere />
          <TimelineMarker look="grad2" />
          <TimelineContent title="Community Preview" look="grad2">
            We published the <strong>New Interfaces</strong> as <InlineCode>@keystone-6</InlineCode>{' '}
            on npm, and have been iterating based on internal & community feedback
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineMarker look="grad1" />
          <TimelineContent title="General Availability" look="grad1">
            Finalised our new architecture and API updates, including comprehensive documentation.
            Published as <InlineCode>@keystone-6</InlineCode> on npm.
          </TimelineContent>
        </TimelineItem>
      </div>

      {/* <Alert css={{ margin: '2rem 0 4rem' }}>
        If you're assessing whether to start a project today on Keystone 5 or 6, check our{' '}
        <Link href="/updates/keystone-5-vs-keystone-6-preview">
          <a>Comparison Page</a>
        </Link>
      </Alert> */}

      <Alert look="tip" css={{ margin: '4rem 0 4rem' }}>
        <span
          css={{
            display: 'inline-block',
            margin: '0 0.8rem 0.5rem 0',
          }}
        >
          Ready to get started with Keystone 6?
        </span>
        <Button as="a" href="/docs">
          Read the Docs <ArrowR />
        </Button>
      </Alert>

      <Type as="h2" look="heading48">
        What's Next
      </Type>

      <Type as="p" look="body18" margin="1rem 0">
        Here are the upcoming technical foundations and features we're planning to focus on. Changes
        that impact API stability are being prioritised ahead of Keystone 6 reaching general
        availability. We've included status markers so you can get an idea of what we're up to with
        each of them.
      </Type>

      <RoadmapItem status="making it happen" title="More guides and walkthroughs">
        <p>
          We know the highest priority for our users is guides and walkthroughs of how to implement
          various solutions with Keystone, so we're planning to greatly expand this part of our
          documentation (including corresponding example repos)
        </p>
      </RoadmapItem>

      <RoadmapItem status="figuring it out" title="New back-end APIs for Node.js apps">
        <p>
          Keystone has so far focused on delivering a great GraphQL API for front-end apps to use.
          We're expanding on this with first class support for accessing the same APIs from Node.js
          so you have more flexibility in how you write your apps, including hybrid use-cases.
        </p>
        <p>
          These new APIs will make fetching and updating your Keystone data from custom GraphQL
          queries and resolvers, express apps, and server-side frameworks like Next.js incredibly
          straight-forward.
        </p>
      </RoadmapItem>
      <RoadmapItem status="figuring it out" title="GraphQL API Updates">
        <p>
          Keystone's GraphQL API has been stable (no breaking changes!) for several years now. While
          this has been great for building front-end apps with confidence, it has held us back from
          fixing some pain points (like error handling) for a while now.
        </p>
        <p>
          We take the stability of code written against Keystone very seriously, and with that in
          mind are planning to make some changes to the API that we expect to provide
          backwards-compatibility and streamlined migration stories for.
        </p>
      </RoadmapItem>
      <RoadmapItem status="wrapping it up" title="Improved Build and Deployment Options">
        <p>
          Deploying a database-backed application to production is still surprisingly complex, and
          it can be challenging to find the right tradeoffs and hosting providers. So we're looking
          at ways Keystone can help streamline these options.
        </p>
        <p>
          This will include building for serverless environments, targeting different architectures
          for your GraphQL API and Admin UI applications, and independent{' '}
          <InlineCode>dev</InlineCode>, <InlineCode>build</InlineCode> and{' '}
          <InlineCode>start</InlineCode>
          commands. Thanks to Prisma, it will also include tools for previewing and managing
          database changes.
        </p>
      </RoadmapItem>
      <RoadmapItem status="making it happen" title="New Image and File functionality">
        <p>
          We are building new functionality for handling images and files in Keystone. Initially
          this will mean support for local image and file uploads, and we have plans to expand this
          into native cloud hosting support as well.
        </p>
      </RoadmapItem>
      <RoadmapItem status="making it happen" title="Better Admin UI Accessibility (a11y)">
        <p>
          As web developers, we all know how important accessibility is, but very few CMS UIs are
          truly accessible. We're changing that by baking first class accessibility into Keystone's
          Admin UI.
        </p>
      </RoadmapItem>
      <RoadmapItem status="theres a plan" title="Field Types Review">
        <p>
          We're planning to revisit our field types and make them more powerful and consistent. This
          will include new interface options for the Admin UI, new features for validation and
          logic, and better <InlineCode>null</InlineCode> value handling.
        </p>
      </RoadmapItem>
      <RoadmapItem status="theres a plan" title="Admin UI Translation">
        <p>
          If you have users who speak a languge other than English, you'll soon be able to provide a
          custom translation for all the strings in Keystone's Admin UI.
        </p>
      </RoadmapItem>
      <RoadmapItem status="figuring it out" title="Custom Admin UI Pages, Navigation and APIs">
        <p>
          As your app outgrows the built-in CRUD queries and mutations that Keystone provides, we
          want the Admin UI to continue to be a comprehensive solution for your users. We're working
          on a framework that will let you extend the Admin UI with your own custom pages, React
          components, API route handlers and navigation - so you can make it your own.
        </p>
      </RoadmapItem>
      <RoadmapItem status="not started" title="Admin UI Field Groups and Dynamic Updates">
        <p>
          When lists get complex, you want to break up the form into multiple sections of fields.
          Also, some fields depend on the value of others, and the form should update dynamically as
          item data is changed.
        </p>
        <p>
          We're planning to design a way of defining this behaviour in your List Schema, so you can
          ship a better authoring experience out of the box.
        </p>
      </RoadmapItem>
      <RoadmapItem status="not started" title="Nested (JSON) Fields">
        <p>
          Often when you're working with items, you want to allow content authors to manage nested
          repeating data. Relationships have traditionally been the answer for this, but come with
          complexity and can't be ordered.
        </p>
        <p>
          So we're looking to add support for defining simplified nested schemas to lists, which
          will be stored in a JSON field in the database.
        </p>
      </RoadmapItem>
      <RoadmapItem status="not started" title="Singletons">
        <p>
          Keystone is great for lists of data, but sometimes you want a single object that is
          editable through the Admin UI and accessible in the GraphQL API. So we're planning to add
          the ability to define singletons in Keystone's Schema.
        </p>
      </RoadmapItem>
      <RoadmapItem status="not started" title="Sortable list items">
        <p>
          Ever wanted a list of items you can sort by dragging and dropping them in the Admin UI? We
          have.
        </p>
        <p>
          And it will custom with custom mutations for handling ordering operations like{' '}
          <InlineCode>insertBefore</InlineCode> and <InlineCode>insertAfter</InlineCode> so it's
          just as easy for you to build your own UIs for sorting items in the list too.
        </p>
      </RoadmapItem>
      <RoadmapItem status="not started" title="Translation Support">
        <p>
          If you're building a website with multi-language support, in Keystone 5 you'd have to add
          individual fields for each translation. To make for a better authoring experience, simpler
          schema definition, and streamlined experience for front-end developers we're planning to
          build first-class support for translated fields into Keystone.
        </p>
      </RoadmapItem>
      <RoadmapItem status="not started" title="Draft / Preview / Publishing Workflow">
        <p>
          Previewing content changes is a critical part of editing with confidence, but it's hard to
          implement consistently across sets of changes in a relational database backend.
        </p>
        <p>
          Now that popular front-ends like Next.js have built-in support for live content previews,
          we're planning to develop an integrated workflow for Keystone content that will allow
          authors to preview sets of content changes in draft, and publish them atomically.
        </p>
        <p>We're also looking at a built-in solution for tracking changes and version history.</p>
      </RoadmapItem>
    </DocsPage>
  );
}

export { getStaticProps };
