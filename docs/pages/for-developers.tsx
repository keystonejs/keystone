/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Image from 'next/image';
import Link from 'next/link';

import { useMediaQuery } from '../lib/media';
import { IntroWrapper, IntroHeading, IntroLead } from '../components/marketing/Intro';
import { CommunityCta } from '../components/marketing/CommunityCta';
import { FrontEndLogos } from '../components/icons/FrontEndLogos';
import { Highlight } from '../components/primitives/Highlight';
import { Relational } from '../components/icons/Relational';
import { TweetBox } from '../components/marketing/TweetBox';
import { MWrapper } from '../components/marketing/MWrapper';
import { Section } from '../components/marketing/Section';
import { CodeBox } from '../components/marketing/CodeBox';
import { Button } from '../components/primitives/Button';
import { EndCta } from '../components/marketing/EndCta';
import { Postgres } from '../components/icons/Postgres';
import { GraphQl } from '../components/icons/GraphQl';
import { Type } from '../components/primitives/Type';
import { ArrowR } from '../components/icons/ArrowR';
import { Nextjs } from '../components/icons/Nextjs';
import { Shield } from '../components/icons/Shield';
import { Prisma } from '../components/icons/Prisma';
import { Pill } from '../components/marketing/Pill';
import { Tick } from '../components/icons/Tick';
import { Cli } from '../components/icons/Cli';
import { Lab } from '../components/icons/Lab';
import { Page } from '../components/Page';

// import contentEditorMockui from '../public/assets/content-editor-mockui.png';

export default function ForDevelopers() {
  const mq = useMediaQuery();

  return (
    <Page>
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
            css={mq({ height: ['3.125rem !important', 'auto !important'] })}
          >
            Read the docs <ArrowR />
          </Button>
          <FrontEndLogos
            css={{
              height: '2rem',
              color: 'var(--muted)',
              marginTop: '2rem',
            }}
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
                100% Javascript
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

        <Section
          css={mq({
            display: 'grid',
            gridTemplateColumns: ['1fr', null, '1fr 1fr'],
            gap: '2rem',
            alignItems: 'center',
          })}
        >
          <TweetBox user="jvredbrown" img="/assets/jvredbrown.jpg" grad="grad3">
            Working with @KeystoneJS is such a pleasant experience. After hand rolling a few GraphQL
            APIs this is lightning fast!
          </TweetBox>
          <div>
            <Type as="h2" look="heading48">
              The APIs you want. <Highlight look="grad3">Because you made them.</Highlight>
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              You can’t boilerplate your way towards a great user experience. That’s why Keystone
              doesn’t limit what you can put in an API. It’s flexible by design: tell Keystone what
              you want in your schema and get the matching APIs you need in return.
            </Type>
            <Link href="/docs/apis/schema">
              <a>Schema API reference →</a>
            </Link>
          </div>
        </Section>

        <Section
          css={mq({
            display: 'grid',
            gridTemplateColumns: ['1fr', null, '1fr 1fr'],
            gap: '2rem',
            alignItems: 'center',
          })}
        >
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
            <Link href="/for-content-management">
              <a>Keystone for content management →</a>
            </Link>
          </div>
          <div>
            TODO
            {/*<Image
              src={contentEditorMockui}
              alt="Content Editor Mock UI"
              width={2109}
              height={1591}
            />*/}
          </div>
        </Section>

        <Section
          css={mq({
            display: 'grid',
            gridTemplateColumns: ['1fr', null, '1fr 1fr'],
            gap: '2rem',
            alignItems: 'center',
          })}
        >
          <div>
            TODO
            {/*<Image
              src={contentEditorMockui}
              alt="Content Editor Mock UI"
              width={2109}
              height={1591}
            />*/}
          </div>
          <div>
            <Type as="h2" look="heading48">
              A Rich Text editor for the{' '}
              <Highlight look="grad3">design system generation.</Highlight>
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              Keystone’s Document field is the first of its kind: intuitive, customisable, and works
              with your design system components. Make it as lean or full-featured as you like. It‘s
              up to you.
            </Type>
            <ul
              css={{
                listStyle: 'none',
                margin: '1rem 0',
                padding: 0,
                '& svg': {
                  height: '1rem',
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
            <Link href="/docs/guides/document-fields">
              <a>Try the demo →</a>
            </Link>
          </div>
        </Section>

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
                height: '2rem',
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
              <Link href="/docs/apis/access-control">
                <a>Access control API →</a>
              </Link>
            </li>
            <li>
              <Relational grad="grad3" />
              <Type as="h3" look="body18bold" margin="1rem 0">
                Flexible relationships
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                One to one. One to many. Many to many. Self referential. It's all there.
              </Type>
              <Link href="/docs/guides/relationships">
                <a>Relationships guide →</a>
              </Link>
            </li>
            <li>
              <Cli grad="grad3" />
              <Type as="h3" look="body18bold" margin="1rem 0">
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
            <li>
              <Lab grad="grad3" />
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
          <Type as="h2" look="heading36">
            Built with the best of the modern web
          </Type>
          buttons buttons buttons
        </Section>

        <CommunityCta />

        <Section>TweetBox TweetBox TweetBox TweetBox</Section>

        <EndCta grad="grad3" />
      </MWrapper>
    </Page>
  );
}
