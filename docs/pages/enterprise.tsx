/** @jsxRuntime classic */
/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Image from 'next/image';
import Link from 'next/link';

import { useMediaQuery } from '../lib/media';
import { IntroWrapper, IntroHeading, IntroLead } from '../components/content/Intro';
import { Highlight } from '../components/primitives/Highlight';
import { MWrapper } from '../components/content/MWrapper';
import { Section, SideBySideSection } from '../components/content/Section';
import { Button } from '../components/primitives/Button';
import { Quote } from '../components/content/Quote';
import { Type } from '../components/primitives/Type';
import { ArrowR } from '../components/icons/ArrowR';
import { Pill } from '../components/content/Pill';
import { Tick } from '../components/icons/Tick';
import { Page } from '../components/Page';
import { ContactForm } from '../components/ContactForm';

import dsGeneration from '../public/assets/ds-generation.png';
import vocal from '../public/assets/vocal-4.png';
import contentManagement2 from '../public/assets/content-management-2.png';
import contentManagement3 from '../public/assets/content-management-3.png';
import contentManagement4 from '../public/assets/content-management-4.png';
import { EndCta } from '../components/content/EndCta';

export default function ForOrganisations() {
  const mq = useMediaQuery();

  return (
    <Page
      title={'KeystoneJS for Content Management'}
      description={
        'Discover how Keystone’s Admin UI is a natural extension of how you work in code, and has the flexibility you need to enable content creatives.'
      }
    >
      <MWrapper>
        <Pill grad="grad6">Keystone for Enterprise</Pill>
        <div
          css={mq({
            display: 'grid',
            gridTemplateColumns: ['1fr', null, '1fr 1fr'],
            gap: '4rem',
            alignItems: 'center',
            paddingTop: '2rem',
            paddingBottom: '2rem',
          })}
        >
          <div>
            <Type as="h" look="heading64">
              Scale Keystone <Highlight look="grad6">with the people who built it</Highlight>
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              Lorem ipsum dolor sit amet fames turpis eget euismod dolore viverra fames enim. Justo
              mauris nisl dolore sodales ut adipiscing dui aenean nisi maecenas odio. A etiam
              interdum auctor in adipiscing velit facilisis dapibus libero erat sagittis.
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
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  [something something]
                </Type>
              </li>
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  [something something]
                </Type>
              </li>
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  [something something]
                </Type>
              </li>
            </ul>
          </div>
          <div>
            <ContactForm
              stacked
              css={mq({
                '& button': {
                  justifySelf: ['center', 'auto'],
                },
              })}
            >
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                Speak to the makers today
              </Type>
            </ContactForm>
          </div>
        </div>

        {/* <IntroWrapper>
          <IntroHeading look="heading64">
            Scale Keystone with the people who <Highlight look="grad6">built it</Highlight>
          </IntroHeading>
          <IntroLead>
            Lorem ipsum dolor sit amet fames turpis eget euismod dolore viverra fames enim. Justo
            mauris nisl dolore sodales ut adipiscing dui aenean nisi maecenas odio. A etiam interdum
            auctor in adipiscing velit facilisis dapibus libero erat sagittis.
          </IntroLead>
        </IntroWrapper> */}
        {/* <Button
          as="a"
          href="/docs/guides/document-fields"
          css={{ marginTop: '2rem' }}
          size="large"
          shadow
        >
          Try the Rich Text demo <ArrowR />
        </Button> */}

        <SideBySideSection reverse>
          <div>
            <Type as="h2" look="heading48">
              Transforming a hunch into a{' '}
              <Highlight look="grad6">multi-million user platform</Highlight> with Keystone.
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              Vocal came to Thinkmill with a great idea and a fast growing community. They needed a
              smart and scalable backend architecture approach to support rapid growth over a five
              year horizon, while delivering immediate value — at the same time. We deployed a
              React, KeystoneJS, and GraphQL stack so they could start fast and scale without
              sacrificing multichannel reach over the long run.
            </Type>
            {/* <ul
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
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  Custom roles for unique teams
                </Type>
              </li>
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  Tailor CRUD for every field
                </Type>
              </li>
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  Secure your content ops
                </Type>
              </li>
            </ul> */}
            <Type as="p" look="body18">
              <Link href="https://www.thinkmill.com.au/work/vocal">Read the Case Study →</Link>
            </Type>
          </div>
          <div>
            <Image
              src={vocal}
              alt="Dropdown selector from Keystone’s Admin UI showing different user roles: Administrator, Editor, Content Manager, Author"
              width={2034}
              height={1300}
              css={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </div>
        </SideBySideSection>
        <Quote
          name="Justin Maury"
          img="https://www.thinkmill.com.au/_astro/vocal-justin-maury@1280w.5316de23.webp"
          title="Chief Operating Officer, Vocal Media"
          grad="grad6"
        >
          Vocal wouldn’t be what it is today without Thinkmill & Keystone. The team shaped the
          product visually, technically, and ethically, as we grew from a hunch to a multi-million
          user network.
        </Quote>

        <SideBySideSection>
          <div>
            <Type as="h2" look="heading48">
              Growing <Highlight look="grad6">beyond Salesforce</Highlight> with Sungage Financial
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              Replatformed Sungage away from Salesforce’s opinionated & inflexible APIs to a
              fit-for-purpose Keystone + GraphQL API architecture that they own & control.
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
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  [something something]
                </Type>
              </li>
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  [something something]
                </Type>
              </li>
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  [something something]
                </Type>
              </li>
            </ul>
            {/* <Type as="p" look="body18">
              <Link href="/docs/fields/overview">Fields API →</Link>
            </Type> */}
          </div>
          <div>
            <Image
              src={vocal}
              alt="Overlay of Admin UI field panes showing fields for a Post content type. Promotional text overlays show: custom and virtual fields; flexible relationships; powerful sort & filtering."
              width={1254}
              height={1107}
              css={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </div>
        </SideBySideSection>

        <Quote
          name="Kevin Stafford"
          img="https://thinkmill.com.au/_astro/kevin-stafford-rugby-au@1280w.24c4530d.webp"
          title="CTO, Rugby Australia"
          grad="grad6"
        >
          Keystone & Thinkmill have played a crucial role in our transformation of Rugby Australia’s
          website network and development practices. Thinkmill are exceptional at what they do, and
          generous with their time and expertise.
        </Quote>
        <div
          css={mq({
            maxWidth: '40rem',
            margin: '5rem auto 0',
          })}
        >
          <ContactForm
            stacked
            css={mq({
              '& button': {
                justifySelf: ['center', 'auto'],
              },
            })}
          >
            <Type as="h2" look="heading48" margin="3rem 0">
              Speak to the makers today
            </Type>
          </ContactForm>
        </div>
      </MWrapper>
    </Page>
  );
}
