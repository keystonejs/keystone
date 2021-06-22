/** @jsx jsx  */
import { jsx } from '@emotion/react';

import { useMediaQuery } from '../lib/media';
import { IntroWrapper, IntroHeading, IntroLead } from '../components/marketing/Intro';
import { Highlight } from '../components/primitives/Highlight';
import { WhyKeystone } from '../components/icons/WhyKeystone';
import { MWrapper } from '../components/marketing/MWrapper';
import { Relational } from '../components/icons/Relational';
import { TweetBox } from '../components/marketing/TweetBox';
import { InlineCode } from '../components/primitives/Code';
import { Automated } from '../components/icons/Automated';
import { Thinkmill } from '../components/icons/Thinkmill';
import { CodeBox } from '../components/marketing/CodeBox';
import { Migration } from '../components/icons/Migration';
import { Button } from '../components/primitives/Button';
import { Emoji } from '../components/primitives/Emoji';
import { Updates } from '../components/icons/Updates';
import { Type } from '../components/primitives/Type';
import { ArrowR } from '../components/icons/ArrowR';
import { Custom } from '../components/icons/Custom';
import { Filter } from '../components/icons/Filter';
import { Shield } from '../components/icons/Shield';
import { Watch } from '../components/icons/Watch';
import { Lab } from '../components/icons/Lab';
import { Page } from '../components/Page';

export default function IndexPage() {
  const mq = useMediaQuery();

  return (
    <Page>
      <MWrapper>
        <IntroWrapper>
          <IntroHeading>
            The <Highlight grad="grad1">superpowered</Highlight> CMS for developers
          </IntroHeading>
          <IntroLead>
            Describe your schema, and Keystone gives you a powerful GraphQL API with a beautiful
            Admin UI for content authoring and data management.
          </IntroLead>
          <IntroLead>
            Focus on shipping the code that matters to you without sacrificing the flexibility or
            power of a bespoke back-end.
          </IntroLead>
        </IntroWrapper>

        <div
          css={mq({
            display: ['grid', 'inline-grid'],
            gridTemplateColumns: ['1fr', 'auto 1fr'],
            alignItems: 'stretch',
            gap: '1rem',
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
        </div>

        <div
          css={mq({
            display: 'grid',
            gridTemplateColumns: ['1fr', null, '0.85fr 1.15fr'],
            gap: ['1rem', '2rem', '4rem'],
            marginTop: '10rem',
          })}
        >
          <div>
            <Type as="h2" look="body20bold" color="var(--text-heading)" margin="0 0 1.5rem 0">
              A Thinkmill product
            </Type>
            <div
              css={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '1rem',
              }}
            >
              <Thinkmill css={{ height: '3.75rem' }} />
              <Type as="p" look="body18" colod="var(--muted)">
                We're an Australian design + development consultancy with a long history working on
                big products at scale for names you know. Keystone is the platform we've always
                wanted to use, so we're building it in the open.
              </Type>
            </div>
          </div>
          <div>
            <Type as="h2" look="body20bold" color="var(--text-heading)" margin="0 0 1.5rem 0">
              Open Source & trusted
            </Type>
            <ul
              css={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'grid',
                gridTemplateColumns: 'auto auto auto',
              }}
            >
              <li>
                <Type as="h3" look="heading48">
                  <Highlight look="grad5">1st</Highlight>
                </Type>
                <Type as="p" look="body18" colod="var(--muted)">
                  NodeJS CMS
                </Type>
              </li>
              <li>
                <Type as="h3" look="heading48">
                  <Highlight look="grad5">900k+</Highlight>
                </Type>
                <Type as="p" look="body18" colod="var(--muted)">
                  <InlineCode>npm</InlineCode> installs
                </Type>
              </li>
              <li>
                <Type as="h3" look="heading48">
                  <Highlight look="grad5">160+</Highlight>
                </Type>
                <Type as="p" look="body18" colod="var(--muted)">
                  contributors
                </Type>
              </li>
            </ul>
          </div>
        </div>

        <div
          css={mq({
            display: 'grid',
            gridTemplateColumns: ['1fr', null, '1fr 1fr 1fr'],
            alignItems: 'flex-start',
            gap: '3rem',
            marginTop: '5rem',
          })}
        >
          <TweetBox user="_kud" img="/assets/_kud.jpg" grad="grad2">
            I think I'm in love. Keystone‘s just what I needed: a Dashboard & Graphql API that works
            like a charm. As a frontend dev with skills in node and elastic search, Keystone +
            GraphQL just feels so right to me <Emoji symbol="❤️️" alt="Love" />
          </TweetBox>
          <TweetBox user="simonswiss" img="/assets/simonswiss.jpg" grad="grad2">
            As someone who lives on the frontend, I love how Keystone lets me define content models
            and gives me the backend I need. I get a sweet GraphQL API, and can stay focused on
            building the UI <Emoji symbol="😍" alt="Love" />
          </TweetBox>
          <TweetBox user="flexdinesh" img="/assets/flexdinesh.jpg" grad="grad2">
            Working with Keystone is a very satisfying experience. I wrapped up 50% of my app’s
            schema, API and seed data in a day <Emoji symbol="😁" alt="Happy" />. The dev experience
            feels too good to be true <Emoji symbol="✨" alt="Sparkle" />{' '}
            <Emoji symbol="🚀" alt="Rocket ship" />
          </TweetBox>
        </div>

        <div
          css={{
            marginTop: '9rem',
          }}
        >
          <Type as="h2" look="heading48">
            Batteries included. <Highlight look="grad5">No limitations.</Highlight>
          </Type>
          <Type as="p" look="body20" margin="0.5rem 0 1.5rem 0">
            Ship a backend easily without surrendering control.
            <br />
            Keystone has all you need to start fast and scale on your terms.
          </Type>
          <ul
            css={mq({
              listStyle: 'none',
              margin: '4rem 0 0 0',
              padding: 0,
              display: 'grid',
              gridTemplateColumns: ['repeat(auto-fit, minmax(7.5rem, 1fr))', '1fr 1fr 1fr 1fr 1fr'],
              gap: '2rem',
              gridRowGap: '4rem',
              '& svg': {
                height: '2.25rem',
                marginBottom: '0.5rem',
              },
            })}
          >
            <li>
              <WhyKeystone grad="grad5" />
              <Type as="p" look="body18">
                All the field types
              </Type>
            </li>
            <li>
              <Shield grad="grad5" />
              <Type as="p" look="body18">
                Access Control
              </Type>
            </li>
            <li>
              <Watch grad="grad5" />
              <Type as="p" look="body18">
                Session Management
              </Type>
            </li>
            <li>
              <Custom grad="grad5" />
              <Type as="p" look="body18">
                Custom Schema
              </Type>
            </li>
            <li>
              <Migration grad="grad5" />
              <Type as="p" look="body18">
                Database Migrations
              </Type>
            </li>
            <li>
              <Lab grad="grad5" />
              <Type as="p" look="body18">
                TypeScript Support
              </Type>
            </li>
            <li>
              <Filter grad="grad5" />
              <Type as="p" look="body18">
                Powerful Filters
              </Type>
            </li>
            <li>
              <Relational grad="grad5" />
              <Type as="p" look="body18">
                Relational Data
              </Type>
            </li>
            <li>
              <Automated grad="grad5" />
              <Type as="p" look="body18">
                Automated CRUD
              </Type>
            </li>
            <li>
              <Updates grad="grad5" />
              <Type as="p" look="body18">
                Event Hooks
              </Type>
            </li>
          </ul>
          <Button as="a" href="/why-keystone#features" look="soft" css={{ marginTop: '4rem' }}>
            See all features <ArrowR />
          </Button>
        </div>

        <div
          css={{
            marginTop: '9rem',
          }}
        >
          <Type as="h2" look="heading48">
            How it works
          </Type>
          <Type as="p" look="body20" margin="0.5rem 0 1.5rem 0">
            Enable a content culture that’s productive, collaborative, and fun.
            <br />
            Open, flexible, and natural. A tool your team can grow with.
          </Type>
        </div>
      </MWrapper>
    </Page>
  );
}
