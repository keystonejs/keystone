/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Image from 'next/image';
import Link from 'next/link';

import { useMediaQuery } from '../lib/media';
import { Highlight } from '../components/primitives/Highlight';
import { Relationship } from '../components/icons/Relationship';
import { WhyKeystone } from '../components/icons/WhyKeystone';
import { MWrapper } from '../components/marketing/MWrapper';
import { Automated } from '../components/icons/Automated';
import { Migration } from '../components/icons/Migration';
import { Button } from '../components/primitives/Button';
import { Emoji } from '../components/primitives/Emoji';
import { Updates } from '../components/icons/Updates';
import { Quote } from '../components/marketing/Quote';
import { Type } from '../components/primitives/Type';
import { ArrowR } from '../components/icons/ArrowR';
import { Custom } from '../components/icons/Custom';
import { Editor } from '../components/icons/Editor';
import { Filter } from '../components/icons/Filter';
import { Shield } from '../components/icons/Shield';
import { Watch } from '../components/icons/Watch';
import { Cli } from '../components/icons/Cli';
import { Lab } from '../components/icons/Lab';
import { Page } from '../components/Page';

import adminUi from '../public/assets/admin-ui.png';

export default function WhyKeystonePage() {
  const mq = useMediaQuery();

  return (
    <Page>
      <MWrapper>
        <Type as="h1" look="heading92">
          Why <Highlight look="grad2">Keystone</Highlight>
        </Type>
        <div
          css={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginTop: '3.75rem',
          }}
        >
          <div>
            <Type as="p" look="body18" color="var(--muted)" margin="0 0 1rem 0">
              Keystone is a Thinkmill product. We’ve spent years shipping sophisticated solutions
              for large companies like Atlassian, Samsung, and Breville. We’ve also helped startups
              get off the ground in a way that lets them deliver immediate value and change as they
              learn.
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="0 0 1rem 0">
              Keystone solves for this spectrum of needs in a way that other backend tools and
              Content Management Systems cannot.
            </Type>
          </div>
          <div>
            <Type as="p" look="body18" color="var(--muted)" margin="0 0 1rem 0">
              Our vision from day one has been to enable a way of building backend solutions that is
              productive, collaborative, and fun. A developer experience that delivers immediate
              value up front so you can start fast and ship at speed, without sacrificing your long
              view.
            </Type>
            <Type as="p" look="body18" color="var(--muted)">
              That's why we built something that’s more than a backend framework, and more than a
              Headless CMS.{' '}
              <strong>It's a platform for next-gen development workflows and evolution.</strong>
            </Type>
          </div>
        </div>

        <div
          css={{
            margin: '6.25rem 0 1rem 0',
          }}
        >
          <Image src={adminUi} alt="Content Editor Mock UI" width={3750} height={2179} />
        </div>

        <ul
          css={mq({
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gridTemplateColumns: ['1fr', '1fr 1fr', null, '1fr 1fr 1fr 1fr'],
            gap: '3rem',
            '& li': {
              maxWidth: '27rem',
              margin: '0 auto',
            },
          })}
        >
          <li>
            <Type as="h2" look="heading20bold">
              The perfect abstractions for low level tasks
            </Type>
            <Type as="p" look="body18" margin="1rem 0" color="var(--muted)">
              Save time on the repetitive stuff. You don't have to reinvent the wheel (or learn how)
              every time you standup a new project.
            </Type>
          </li>
          <li>
            <Type as="h2" look="heading20bold">
              Control in the places you need it most
            </Type>
            <Type as="p" look="body18" margin="1rem 0" color="var(--muted)">
              When it’s time to customize for business logic, everything you need is at your
              fingertips. What’s not built-in won’t block you from moving forward.
            </Type>
          </li>
          <li>
            <Type as="h2" look="heading20bold">
              Escape hatches where you need them
            </Type>
            <Type as="p" look="body18" margin="1rem 0" color="var(--muted)">
              Like React, Keystone is engineered with escape hatches in mind. So your not locked in
              to Keystone’s way of thinking, except when it works for you.
            </Type>
          </li>
          <li>
            <Type as="h2" look="heading20bold">
              Built on tooling you know and love
            </Type>
            <Type as="p" look="body18" margin="1rem 0" color="var(--muted)">
              Keystone is built on the idea that if you understand vanilla JavaScript, you can
              succeed with Keystone. Increase your capability without changing lanes.
            </Type>
          </li>
        </ul>
        <div
          css={{
            textAlign: 'center',
            marginTop: '3rem',
          }}
        >
          <Button as="a" href="/docs" look="soft">
            Discover how Keystone works <ArrowR />
          </Button>
        </div>

        <Quote
          name="Erwann Mest"
          title="Lead frontend engineer @contexte"
          img="/assets/_kud.jpg"
          grad="grad2"
        >
          I think I'm in love. Keystone‘s just what I needed: a Dashboard & Graphql API that works
          like a charm. As a frontend dev with skills in node and elastic search, Keystone + GraphQL
          just feels so right to me <Emoji symbol="♥️" alt="Love" />
        </Quote>

        <section
          css={{
            marginTop: '9rem',
          }}
        >
          <Type as="h2" look="heading48">
            What's in <Highlight look="grad2">the box?</Highlight>
          </Type>
          <Type as="p" look="body20" margin="0.5rem 0 1.5rem 0" css={{ maxWidth: '45rem' }}>
            Everything you need to start fast and scale sustainably. We’ve done the heavy lifting so
            you can work on what matters without getting boxed in.
          </Type>
          <ul
            css={mq({
              listStyle: 'none',
              margin: '4rem 0 0 0',
              padding: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(12.5rem, 1fr))',
              gap: '2rem',
              gridRowGap: '4rem',
              '& svg': {
                height: '2.25rem',
                marginBottom: '0.5rem',
              },
            })}
          >
            <li>
              <Automated grad="grad2" />
              <Type as="h3" look="heading20bold">
                Automated CRUD
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                Out of the box data ops for every field type. A powerful GraphQL API from day one.
              </Type>
              <Link href="/docs/apis/access-control">
                <a>Access control API →</a>
              </Link>
            </li>
            <li>
              <Custom grad="grad2" />
              <Type as="h3" look="heading20bold">
                Extensible GraphQL API
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                Extend the CRUD API for more control over what you do. Customize it to your frontend
                needs.
              </Type>
              <Link href="/todo">
                <a>TODO: Try the example →</a>
              </Link>
            </li>
            <li>
              <Editor grad="grad2" />
              <Type as="h3" look="heading20bold">
                Next-gen WYSIWYG
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                Highly configurable. Design systems friendly. BYO custom React components.
                Structured JSON output.
              </Type>
              <Link href="/docs/guides/document-fields">
                <a>Try the editor →</a>
              </Link>
            </li>
            <li>
              <Watch grad="grad2" />
              <Type as="h3" look="heading20bold">
                Session management
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                Start and end sessions from the GraphQL API. Secure your data using access control.
              </Type>
              <Link href="/docs/apis/session">
                <a>Session API →</a>
              </Link>
            </li>
            <li>
              <Lab grad="grad2" />
              <Type as="h3" look="heading20bold">
                100% Typescript
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0 0 0">
                Ship fewer bugs with a statically typed workflow. Get Keystone type definitions as
                you write.
              </Type>
            </li>
            <li>
              <Shield grad="grad2" />
              <Type as="h3" look="heading20bold">
                Custom roles & access
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                Build your own roles-based access controls. No limits on the amount and kind of
                roles you can configure.
              </Type>
              <Link href="/todo">
                <a>TODO: Learn more →</a>
              </Link>
            </li>
            <li>
              <Relationship grad="grad2" />
              <Type as="h3" look="heading20bold">
                Flexible relationships
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                One to one. One to many. Many to many. Self referential. It's all there.
              </Type>
              <Link href="/todo">
                <a>TODO: Try the example →</a>
              </Link>
            </li>
            <li>
              <Filter grad="grad2" />
              <Type as="h3" look="heading20bold">
                Powerful filtering
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                Find what you need when you need it with intuitive filters.
              </Type>
              <Link href="/todo">
                <a>TODO: Filters guide →</a>
              </Link>
            </li>
            <li>
              <Migration grad="grad2" />
              <Type as="h3" look="heading20bold">
                Database migrations
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0 0 0">
                Keep your database in sync with schema thanks to Prisma.io migrations.
              </Type>
            </li>
            <li>
              <WhyKeystone grad="grad2" />
              <Type as="h3" look="heading20bold">
                Extensive field types
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                An editing environment you can shape to the needs of any project. No boilerplate.
                Everything as you make it.
              </Type>
              <Link href="/docs/apis/fields">
                <a>Fields API →</a>
              </Link>
            </li>
            <li>
              <Updates grad="grad2" />
              <Type as="h3" look="heading20bold">
                Event Hooks
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                Put custom logic in your data ops. Modify data, trigger events, validate inputs –
                it's up to you.
              </Type>
              <Link href="/docs/guides/hooks">
                <a>Hooks guide →</a>
              </Link>
            </li>
            <li>
              <Cli grad="grad2" />
              <Type as="h3" look="heading20bold">
                Intuitive CLI
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                Kickstart new projects and try examples on for size from the comfort of your
                terminal.
              </Type>
              <Link href="/docs/guides/cli">
                <a>CLI guide →</a>
              </Link>
            </li>
          </ul>
          <Button as="a" href="/why-keystone#features" css={{ marginTop: '4rem' }}>
            See all features <ArrowR />
          </Button>
        </section>

        <Quote
          name="Dinesh Pandiyan"
          title="JavaScript Developer | Thinkmill"
          img="/assets/flexdinesh.jpg"
          grad="grad2"
        >
          With Keystone I could create a new data type, custom queries and mutations, and access it
          all in a GraphQL playground in less than 15 mins. It’s so satisfying to make server-side
          changes without having to spend time on the database. Keystone is magical and I love it.
        </Quote>
      </MWrapper>
    </Page>
  );
}
