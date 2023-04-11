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

        <SideBySideSection reverse>
          <div>
            <Type as="h2" look="heading48">
              Lorem ipsum dolor sit amet, <Highlight look="grad6">consectetur</Highlight> adipiscing elit.
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              Sed consequat, sapien eget sagittis faucibus, ipsum tortor euismod velit, vel euismod augue sapien eu quam.
              Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
            </Type>
            <Type as="p" look="body18">
              <Link href="https://www.thinkmill.com.au/work/">Read the Case Study →</Link>
            </Type>
          </div>
        </SideBySideSection>

        <SideBySideSection>
          <div>
            <Type as="h2" look="heading48">
              Lorem ipsum dolor sit amet, <Highlight look="grad6">consectetur</Highlight> adipiscing elit.
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              Sed consequat, sapien eget sagittis faucibus, ipsum tortor euismod velit, vel euismod augue sapien eu quam. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
              (waiting for quote)
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
        </SideBySideSection>

        <Quote
          name="Kevin Stafford"
          img="https://thinkmill.com.au/_astro/kevin-stafford-rugby-au@1280w.24c4530d.webp"
          title="CTO, Rugby Australia"
          grad="grad6"
        >
          Since moving from Sitecore to Keystone 6, development and site performance have never been faster.
          We integrated live scores seamlessly with our new GraphQL API, and the Document field has transformed our Design System and content workflows.
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
