/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { useMediaQuery } from '../lib/media';
import { IntroWrapper, IntroHeading, IntroLead } from '../components/marketing/Intro';
import { CommunityCta } from '../components/marketing/CommunityCta';
import { FrontEndLogos } from '../components/icons/FrontEndLogos';
import { Highlight } from '../components/primitives/Highlight';
import { TweetBox } from '../components/marketing/TweetBox';
import { MWrapper } from '../components/marketing/MWrapper';
import { Section } from '../components/marketing/Section';
import { CodeBox } from '../components/marketing/CodeBox';
import { Button } from '../components/primitives/Button';
import { Postgres } from '../components/icons/Postgres';
import { GraphQl } from '../components/icons/GraphQl';
import { Type } from '../components/primitives/Type';
import { Nextjs } from '../components/icons/Nextjs';
import { Prisma } from '../components/icons/Prisma';
import { ArrowR } from '../components/icons/ArrowR';
import { Pill } from '../components/marketing/Pill';
import { Page } from '../components/Page';

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
          <TweetBox user="TODO" img="/assets/_kud.jpg" grad="grad3">
            Working with Keystone is such a pleasant experience. After hand-rolling a few GraphQL
            APIs, this is lightning fast!
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

        <Section>text [picture]</Section>

        <Section>[picture] text</Section>

        <Section>
          <Type as="h2" look="heading30">
            Start learning today
          </Type>
          [logo] [logo] [logo] [logo] [logo]
        </Section>

        <Section>
          <Type as="h2" look="heading36">
            Built with the best of the modern web
          </Type>
          buttons buttons buttons
        </Section>

        <CommunityCta />

        <Section>TweetBox TweetBox TweetBox TweetBox</Section>
      </MWrapper>
    </Page>
  );
}
