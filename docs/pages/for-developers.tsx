/** @jsxRuntime classic */
/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Image from 'next/image';
import Link from 'next/link';

import { useMediaQuery } from '../lib/media';
import { IntroWrapper, IntroHeading, IntroLead } from '../components/content/Intro';
import { CommunityCta } from '../components/content/CommunityCta';
import { FrontEndLogos } from '../components/icons/FrontEndLogos';
import { Highlight } from '../components/primitives/Highlight';
import { Relational } from '../components/icons/Relational';
import { TweetBox } from '../components/content/TweetBox';
import { MWrapper } from '../components/content/MWrapper';
import { Typescript } from '../components/icons/Typescript';
import { Section, SideBySideSection } from '../components/content/Section';
import { CodeBox } from '../components/content/CodeBox';
import { Button } from '../components/primitives/Button';
import { EndCta } from '../components/content/EndCta';
import { Postgres } from '../components/icons/Postgres';
import { Emoji } from '../components/primitives/Emoji';
import { GraphQl } from '../components/icons/GraphQl';
import { Type } from '../components/primitives/Type';
import { ArrowR } from '../components/icons/ArrowR';
import { Nextjs } from '../components/icons/Nextjs';
import { Shield } from '../components/icons/Shield';
import { Prisma } from '../components/icons/Prisma';
import { Pill } from '../components/content/Pill';
import { Tick } from '../components/icons/Tick';
import { Cli } from '../components/icons/Cli';
import { Page } from '../components/Page';

import editorStorytelling from '../public/assets/editor-storytelling.png';
import richTextEditor from '../public/assets/rich-text-editor.png';

export default function ForDevelopers() {
  const mq = useMediaQuery();

  return (
    <Page
      title={'KeystoneJS for Developers'}
      description={
        'How the Keystone developer experience gives you the power to design APIs on the fly, build custom editing experiences, and deliver content to any frontend framework. All in version controllable code.'
      }
    >
      <MWrapper>
        <Pill grad="grad3">Keystone for developers</Pill>
        <IntroWrapper>
          <IntroHeading>
            The <Highlight look="grad3">ideal backend </Highlight> for your favourite frontend
          </IntroHeading>
          <IntroLead>
            Build sophisticated experiences with a framework that saves time and won't lock you in.
            Design APIs on the fly, give editors what they need, and ship to any frontend you like.
            All in version controllable code.
          </IntroLead>
        </IntroWrapper>

        <div
          css={mq({
            display: ['grid', 'inline-grid'],
            gridTemplateColumns: ['1fr', 'auto 1fr'],
            alignItems: 'stretch',
            gap: '1rem',
            marginTop: '2.5rem',
          })}
        >
          <CodeBox code="yarn create keystone-app" />
          <Button
            as="a"
            href="/docs"
            look="soft"
            size="large"
            shadow
            css={mq({ height: ['3.125rem !important', 'auto !important'] })}
          >
            Read the docs <ArrowR />
          </Button>
          <FrontEndLogos
            css={mq({
              color: 'var(--muted)',
              // opacity: 0.75,
              maxWidth: '48.125rem',
              marginTop: '2rem',
              gridColumn: ['1', '1 / 3'],
            })}
          />
        </div>

        <Section>
          <Type as="h2" look="heading36">
            Built with the best of the modern web
          </Type>
          <ul
            css={mq({
              display: 'grid',
              gridTemplateColumns: ['1fr', '1fr 1fr', '1fr 1fr 1fr 1fr'],
              gap: '2rem',
              listStyle: 'none',
              margin: '2rem 0 0 0',
              padding: 0,
              '& svg': {
                height: '4.125rem',
                color: 'var(--muted)',
              },
              '& li': {
                maxWidth: '13.75rem',
                margin: '0 auto',
              },
            })}
          >
            <li>
              <Prisma />
              <Type as="h3" look="body18bold" margin="1rem 0">
                Schema
              </Type>
              <Type as="p" look="body18" color="var(--muted)">
                With Prisma.io
                <br />
                100% JavaScript
                <br />
                Version controllable
              </Type>
            </li>
            <li>
              <GraphQl />
              <Type as="h3" look="body18bold" margin="1rem 0">
                GraphQL API
              </Type>
              <Type as="p" look="body18" color="var(--muted)">
                With Apollo Server
                <br />
                Flexible & Extensible
              </Type>
            </li>
            <li>
              <Nextjs />
              <Type as="h3" look="body18bold" margin="1rem 0">
                Admin UI
              </Type>
              <Type as="p" look="body18" color="var(--muted)">
                With Next.js
                <br />
                Intuitive & configurable
              </Type>
            </li>
            <li>
              <Postgres />
              <Type as="h3" look="body18bold" margin="1rem 0">
                Database & Assets
              </Type>
              <Type as="p" look="body18" color="var(--muted)">
                Postgres & SQLite
                <br />
                Cloud & self-hosted
              </Type>
            </li>
          </ul>
        </Section>

        <SideBySideSection reverse>
          <div>
            <Type as="h2" look="heading48">
              The APIs you want. <Highlight look="grad3">Because you made them.</Highlight>
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              You can’t boilerplate your way towards a great user experience. That’s why Keystone
              doesn’t limit what you can put in an API. It’s flexible by design: tell Keystone what
              you want in your schema and get the matching APIs you need in return.
            </Type>
            <Type as="p" look="body18">
              <Link href="/docs/apis/schema">
                <a>Schema API reference →</a>
              </Link>
            </Type>
          </div>
          <TweetBox user="jvredbrown" img="/assets/jvredbrown.jpg" grad="grad3">
            Working with @KeystoneJS is such a pleasant experience. After hand rolling a few GraphQL
            APIs this is lightning fast!
          </TweetBox>
        </SideBySideSection>

        <SideBySideSection>
          <div>
            <Type as="h2" look="heading48">
              A content studio your storytellers will{' '}
              <Highlight look="grad3">rally around.</Highlight>
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              Give your editors what they need without changing tools. Keystone has a highly
              configurable CMS built in. Program with JavaScript, store changes in version control,
              and integrate with your preferred CI tools.
            </Type>
            <Type as="p" look="body18">
              <Link href="/for-content-management">
                <a>Keystone for content management →</a>
              </Link>
            </Type>
          </div>
          <div>
            <Image
              src={editorStorytelling}
              alt="Overlay of Admin UI field panes showing fields for a Post content type. Promotional text overlays show: extensive field options; flexible relationships; powerful sort & filtering."
              width={1975}
              height={1572}
            />
          </div>
        </SideBySideSection>

        <SideBySideSection reverse>
          <div>
            <Type as="h2" look="heading48">
              A Rich Text editor for the{' '}
              <Highlight look="grad3">design system generation.</Highlight>
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              Keystone’s Document field is the first of its kind: intuitive, customisable, and works
              with your design system components. Make it as lean or full-featured as you like. It’s
              up to you.
            </Type>
            <ul
              css={{
                listStyle: 'none',
                margin: '1rem 0',
                padding: 0,
                '& li': {
                  display: 'flex',
                  alignItems: 'center',
                },
                '& svg': {
                  height: '1.25rem',
                  marginRight: '0.75rem',
                },
              }}
            >
              <li>
                <Tick grad="grad3" />
                <Type look="body18" color="var(--muted)">
                  Configurable interface
                </Type>
              </li>
              <li>
                <Tick grad="grad3" />
                <Type look="body18" color="var(--muted)">
                  BYO custom React components
                </Type>
              </li>
              <li>
                <Tick grad="grad3" />
                <Type look="body18" color="var(--muted)">
                  Structured JSON output
                </Type>
              </li>
            </ul>
            <Type as="p" look="body18">
              <Link href="/docs/guides/document-field-demo">
                <a>Try the demo →</a>
              </Link>
            </Type>
          </div>
          <div>
            <Image
              src={richTextEditor}
              alt="Keystone Document field containing Rich Text content including Twitter embed component, and syntax highlighted code block."
              width={1901}
              height={1629}
            />
          </div>
        </SideBySideSection>

        <Section>
          <Type as="h2" look="heading48" css={{ maxWidth: '41.875rem' }}>
            The features you need to{' '}
            <Highlight look="grad3">start fast and scale sustainably.</Highlight>
          </Type>
          <ul
            css={mq({
              display: 'grid',
              gridTemplateColumns: ['1fr', '1fr 1fr', '1fr 1fr 1fr 1fr'],
              gap: '2rem',
              listStyle: 'none',
              margin: '3rem 0 0 0',
              padding: 0,
              '& svg': {
                height: '3rem',
                color: 'var(--muted)',
              },
              '& li': {
                maxWidth: '13.75rem',
                margin: '0 auto',
              },
            })}
          >
            <li>
              <Shield grad="grad3" />
              <Type as="h3" look="body18bold" margin="1rem 0">
                Custom roles & access
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                Build your own roles-based access controls. No limits on the amount and kind of
                roles you can configure.
              </Type>
              <Type as="p" look="body18">
                <Link href="/docs/apis/access-control">
                  <a>Access control API →</a>
                </Link>
              </Type>
            </li>
            <li>
              <Relational grad="grad3" />
              <Type as="h3" look="body18bold" margin="1rem 0">
                Flexible relationships
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                One to one. One to many. Many to many. Self-referential. It's all there.
              </Type>
              <Type as="p" look="body18">
                <Link href="/docs/guides/relationships">
                  <a>Relationships guide →</a>
                </Link>
              </Type>
            </li>
            <li>
              <Cli grad="grad3" />
              <Type as="h3" look="body18bold" margin="1rem 0">
                Intuitive CLI
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                Kick start new projects and try examples on for size from the comfort of your
                terminal.
              </Type>
              <Type as="p" look="body18">
                <Link href="/docs/guides/cli">
                  <a>CLI guide →</a>
                </Link>
              </Type>
            </li>
            <li>
              <Typescript grad="grad3" />
              <Type as="h3" look="body18bold" margin="1rem 0">
                100% Typescript
              </Type>
              <Type as="p" look="body18" color="var(--muted)">
                Ship fewer bugs with a statically typed workflow. Get Keystone type definitions as
                you write.
              </Type>
            </li>
          </ul>
        </Section>

        <Section>
          <Type as="h2" look="heading30">
            Start learning today
          </Type>
          <Type as="h3" look="heading20bold" margin="1.5rem 0 1rem 0">
            Keystone foundations
          </Type>
          <ul
            css={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <li>
              <Button as="a" href="/docs" look="soft">
                Docs <ArrowR />
              </Button>
            </li>
            <li>
              <Button
                as="a"
                href="/docs/walkthroughs/getting-started-with-create-keystone-app"
                look="soft"
              >
                Getting started <ArrowR />
              </Button>
            </li>
            <li>
              <Button as="a" href="/docs/apis" look="soft">
                API reference <ArrowR />
              </Button>
            </li>
          </ul>
          <Type as="h3" look="heading20bold" margin="2rem 0 1rem 0">
            Best practice examples
          </Type>
          <ul
            css={{
              listStyle: 'none',
              margin: '1rem 0 0 0',
              padding: 0,
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <li>
              <Button
                as="a"
                href="https://github.com/keystonejs/keystone/tree/main/examples/blog"
                target="_blank"
                rel="noopener noreferrer"
                look="soft"
              >
                Blog <ArrowR />
              </Button>
            </li>
            <li>
              <Button
                as="a"
                href="https://github.com/keystonejs/keystone/tree/main/examples/task-manager"
                target="_blank"
                rel="noopener noreferrer"
                look="soft"
              >
                Task Manager app <ArrowR />
              </Button>
            </li>
            <li>
              <Button
                as="a"
                href="https://github.com/keystonejs/keystone/tree/main/examples/default-values"
                target="_blank"
                rel="noopener noreferrer"
                look="soft"
              >
                Default field values <ArrowR />
              </Button>
            </li>
            <li>
              <Button
                as="a"
                href="https://github.com/keystonejs/keystone/tree/main/examples/extend-graphql-schema"
                target="_blank"
                rel="noopener noreferrer"
                look="soft"
              >
                Extend GraphQL schema <ArrowR />
              </Button>
            </li>
          </ul>
        </Section>

        <CommunityCta />

        <Section>
          <Type as="h2" look="heading48">
            Don’t just take <Highlight look="grad3">our word for it.</Highlight>
          </Type>
          <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
            People on the internet say some really nice things about KeystoneJS
          </Type>
          <div
            css={mq({
              display: 'grid',
              gridTemplateColumns: ['1fr', '1fr 1fr 1fr'],
              gap: ['1rem', '2rem'],
              marginTop: '2.5rem',
              alignItems: 'baseline',
              gridTemplateRows: 'masonry', // experimental and hopefully supported soon
            })}
          >
            <TweetBox user="nemeo" img="/assets/benoit-richert.jpg" grad="grad3">
              How good is Keystone support! The answers are fast, thought through, technical when
              needed, and always gentle... Kudos to the Keystone team, thank you very much!{' '}
              <Emoji symbol="😊" alt="Blush" />
            </TweetBox>
            <TweetBox user="wesbos" img="/assets/wesbos-square.jpg" grad="grad3">
              I love how Keystone’s access control lets me declare every single Create, Read,
              Update, and Delete operation at both the <strong>model</strong> and{' '}
              <strong>field</strong> level. It’s my favorite way of implementing Auth.
            </TweetBox>
            <TweetBox user="flexdinesh" img="/assets/flexdinesh.jpg" grad="grad3">
              Working with Keystone is a very satisfying experience. I wrapped up 50% of my app’s
              schema, API and seed data in a day <Emoji symbol="😁" alt="Happy" /> The dev
              experience feels too good to be true <Emoji symbol="✨" alt="Sparkle" />{' '}
              <Emoji symbol="🚀" alt="Rocket ship" />
            </TweetBox>
            <TweetBox user="divslingerx" img="/assets/divslingerx.jpg" grad="grad3">
              <a href="https://twitter.com/keystonejs" target="_blank" rel="noopener noreferrer">
                @KeystoneJS
              </a>{' '}
              is almost too good to be open source. I can’t stress enough how awesome the dev
              experience is. This is what I wish WordPress was.
            </TweetBox>
            <TweetBox user="_kud" img="/assets/_kud.jpg" grad="grad3">
              I think I'm in love. Keystone‘s just what I needed: a dashboard &amp; GraphQL API that
              works like a charm. As a frontend dev with skills in node and elastic search, Keystone
              + GraphQL just feels so right to me <Emoji symbol="❤️️" alt="Love" />
            </TweetBox>
            <TweetBox user="simonswiss" img="/assets/simonswiss.jpg" grad="grad3">
              As someone who lives on the frontend, I love how Keystone lets me define content
              models and gives me the backend I need. I get a sweet GraphQL API, and can stay
              focused on building the UI <Emoji symbol="😍" alt="Love" />
            </TweetBox>
            <TweetBox user="mxstbr" img="/assets/mxstbr.jpg" grad="grad3">
              The new{' '}
              <a href="https://twitter.com/keystonejs" target="_blank" rel="noopener noreferrer">
                @KeystoneJS
              </a>{' '}
              rich text editor has incredible inline React component support, including editing
              props and everything!
            </TweetBox>
            <TweetBox user="mattiloh" img="/assets/mattiloh.jpg" grad="grad3">
              Keystone‘s new customisable Document field is really powerful and quite a unique
              selling proposition. Great job team Keystone <Emoji symbol="👏🏼" alt="Hand clapping" />
            </TweetBox>
            <TweetBox user="BenAPatton" img="/assets/benapatton.jpg" grad="grad3">
              My mind is being blown today! Combining{' '}
              <a href="https://twitter.com/keystonejs" target="_blank" rel="noopener noreferrer">
                @KeystoneJS
              </a>{' '}
              with{' '}
              <a href="https://twitter.com/supabase_io" target="_blank" rel="noopener noreferrer">
                @supabase_io
              </a>{' '}
              and the experience is just magical.
            </TweetBox>
          </div>
        </Section>

        <EndCta grad="grad3" />
      </MWrapper>
    </Page>
  );
}
