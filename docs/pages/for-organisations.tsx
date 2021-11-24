/** @jsxRuntime classic */
/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Image from 'next/image';
import Link from 'next/link';

import { useMediaQuery } from '../lib/media';
import { IntroWrapper, IntroHeading, IntroLead } from '../components/content/Intro';
import { Highlight } from '../components/primitives/Highlight';
import { ClientLogos } from '../components/icons/ClientLogos';
import { TweetBox } from '../components/content/TweetBox';
import { MWrapper } from '../components/content/MWrapper';
import { Section } from '../components/content/Section';
import { Thinkmill } from '../components/icons/Thinkmill';
import { Quote } from '../components/content/Quote';
import { Type } from '../components/primitives/Type';
import { Pill } from '../components/content/Pill';
import { Tick } from '../components/icons/Tick';
import { Page } from '../components/Page';

import editor from '../public/assets/editor.png';
import dataIntegrity from '../public/assets/data-integrity.png';
import { EndCta } from '../components/content/EndCta';

export default function ForOrganisations() {
  const mq = useMediaQuery();

  return (
    <Page
      title={'KeystoneJS for Organisations'}
      description={
        'Discover how Keystone’s flexibility lets organisations scale fast and sustainably with a backend that can be shaped to any business logic.'
      }
    >
      <MWrapper>
        <Pill grad="grad4">Keystone for organisations</Pill>
        <IntroWrapper>
          <IntroHeading>
            Flexibility <Highlight look="grad4">by design</Highlight>
          </IntroHeading>
          <Type as="h2" look="heading24" margin="0 0 1rem">
            The content backend you can shape to fit any business logic.
          </Type>
          <IntroLead>
            Keystone combines the controls you need for complex solutions with the simplicity and
            composability of a well-designed JavaScript framework. Start simply, improve as you go,
            and adapt to new opportunities when they arise.
          </IntroLead>
        </IntroWrapper>

        <Type as="h2" look="body18bold" margin="3rem 0 1rem 0" color="var(--muted)">
          Used by:
        </Type>
        <ClientLogos
          css={{
            color: 'var(--muted)',
            opacity: 0.5,
            maxWidth: '48.125rem',
          }}
        />

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
              Bring your code and content <Highlight look="grad4">people together.</Highlight>
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              Balance both sides of your code+content equation with a framework that suits
              everybody. Give storytellers the roles and fields they need with tools your developers
              know and love.
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
                <Tick grad="grad4" />
                <Type look="body18" color="var(--muted)">
                  Extensive field types
                </Type>
              </li>
              <li>
                <Tick grad="grad4" />
                <Type look="body18" color="var(--muted)">
                  Custom auth & access control
                </Type>
              </li>
              <li>
                <Tick grad="grad4" />
                <Type look="body18" color="var(--muted)">
                  Integrates with any frontend
                </Type>
              </li>
            </ul>
            <Type as="p" look="body18">
              <Link href="/for-developers" passHref>
                <a>Keystone for developers →</a>
              </Link>
            </Type>
            <Type as="p" look="body18">
              <Link href="/for-content-management">
                <a>Keystone for content management →</a>
              </Link>
            </Type>
          </div>
          <div>
            <Image
              src={editor}
              alt="Two application windows. One shows an IDE with Keystone schema code to configure fields. The other shows content fields in Keystone Admin UI"
              width={1956}
              height={1845}
            />
          </div>
        </Section>

        <Quote
          name="Kevin Stafford"
          title="General Manager Technology | Rugby Australia"
          img="/assets/kevin-stafford.jpg"
          grad="grad4"
        >
          Since moving from Sitecore to Keystone 6, development and site performance have never been
          faster. We integrated live scores seamlessly with our new GraphQL API, and the Document
          field has transformed our Design System and content workflows.
        </Quote>

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
              Reach your audience <Highlight look="grad4">in any channel.</Highlight>
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              Connect to your audience wherever you find them with an API-first headless CMS. You
              don’t need a separate back-end for every site and app you run. Manage your message
              from a single source of truth and expose it to any frontend application.
            </Type>
            <Type as="p" look="body18">
              <Link href="/why-keystone#solutions">
                <a>See all solutions →</a>
              </Link>
            </Type>
          </div>
          <TweetBox user="jvredbrown" img="/assets/jvredbrown.jpg" grad="grad4">
            Working with @KeystoneJS is such a pleasant experience. After hand rolling a few GraphQL
            APIs this is lightning fast!
          </TweetBox>
        </Section>

        <Section
          css={{
            textAlign: 'center',
          }}
        >
          <div
            css={{
              position: 'relative',
              display: 'inline-flex',
              height: '14rem',
              width: '14rem',
              alignItems: 'center',
              justifyContent: 'center',
              '&:before, &:after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '14rem',
                height: '14rem',
                border: '6px solid #ff3838',
                borderRadius: '100%',
                opacity: 0.04,
              },
              '&:after': {
                width: '11rem',
                height: '11rem',
                top: '1.5rem',
                left: '1.5rem',
                opacity: 0.14,
              },
            }}
          >
            <Thinkmill
              css={{
                display: 'inline-block',
                height: '8rem',
              }}
            />
          </div>
          <Type as="h2" look="heading48" margin="3rem auto 1rem">
            Made by people who <Highlight look="grad4">know business.</Highlight>
          </Type>
          <Type
            as="p"
            look="body20"
            color="var(--muted)"
            css={{
              display: 'block',
              maxWidth: '40rem',
              margin: '1rem auto',
            }}
          >
            Built by{' '}
            <a href="https://www.thinkmill.com.au" target="_blank" rel="noopener noreferrer">
              Thinkmill
            </a>
            , an internationally recognised design & development consultancy. Keystone is proven in
            the field of business, and designed to fit the needs of organisations that scale.
          </Type>
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
              Data. <Highlight look="grad4">Integrity.</Highlight>
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              Benefit from the power of a full-featured relational database without being locked in
              to a proprietary platform. Host your own data and define your own access to stay in
              control.
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
                <Tick grad="grad4" />
                <Type look="body18" color="var(--muted)">
                  Self-hosting options
                </Type>
              </li>
              <li>
                <Tick grad="grad4" />
                <Type look="body18" color="var(--muted)">
                  Postgres and SQLite support
                </Type>
              </li>
              <li>
                <Tick grad="grad4" />
                <Type look="body18" color="var(--muted)">
                  No walled gardens for your content
                </Type>
              </li>
            </ul>
          </div>
          <div>
            <Image
              src={dataIntegrity}
              alt="2 application panes. One displays a database configuration app with DB columns and rows containing content. The other displays the same column and row content in Keystone Admin UI."
              width={2044}
              height={1557}
            />
          </div>
        </Section>

        <Section>
          <Type as="h1" look="heading48" css={{ maxWidth: '53.125rem' }}>
            With Keystone, the future’s still yours.{' '}
            <Highlight look="grad4">We just make it easier to get there.</Highlight>
          </Type>
          <div
            css={mq({
              display: 'grid',
              gridTemplateColumns: ['1fr', '1fr 1fr'],
              gap: '2rem',
              marginTop: '3.75rem',
            })}
          >
            <div>
              <Type as="p" look="body18" color="var(--muted)" margin="0 0 1rem 0">
                When you're <strong>growing a project</strong>, solving for repetitive tasks can
                mean the difference between success and failure. You can choose tools with strong
                opinions to solve what you know today, but you <strong>risk</strong> binding your
                future to tools that <strong>can't adapt as you grow</strong>.
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="0 0 1rem 0">
                Keystone bridges this gap. You get to <strong>work fast</strong> with features that
                provide the perfect amount of abstraction, but you're also{' '}
                <strong>never fenced</strong> in by what it provides.
              </Type>
            </div>
            <div>
              <Type as="p" look="body18" color="var(--muted)" margin="0 0 1rem 0">
                <strong>Own your own data</strong>, configure things the way you need, and stay{' '}
                <strong>ready for change</strong> when it comes. We even put escape hatches in all
                the right places, so when you need to externalise a feature or integrate with other
                software – you can.
              </Type>
              <Type as="p" look="body18" color="var(--muted)">
                When your success demands you need to go 100% bespoke, Keystone engineers its own
                redundancy, so you can move to your own thing gracefully,{' '}
                <strong>on your terms</strong>.
              </Type>
            </div>
          </div>
          {/* <Button as="a" href="/why-keystone" css={{ marginTop: '2rem' }}>
            Why we built Keystone <ArrowR />
          </Button> */}
        </Section>
        <EndCta grad="grad4" />
      </MWrapper>
    </Page>
  );
}
