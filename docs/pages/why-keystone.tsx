/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Image from 'next/image';
import Link from 'next/link';

import { useMediaQuery } from '../lib/media';
import { Highlight } from '../components/primitives/Highlight';
import { Relationship } from '../components/icons/Relationship';
import { WhyKeystone } from '../components/icons/WhyKeystone';
import { MWrapper } from '../components/content/MWrapper';
import { TweetBox } from '../components/content/TweetBox';
import { Typescript } from '../components/icons/Typescript';
import { Automated } from '../components/icons/Automated';
import { Migration } from '../components/icons/Migration';
import { Section } from '../components/content/Section';
import { Button } from '../components/primitives/Button';
import { AdvancedReactCta } from '../components/content/AdvancedReactCta';
import { EndCta } from '../components/content/EndCta';
import { Emoji } from '../components/primitives/Emoji';
import { Updates } from '../components/icons/Updates';
import { Quote } from '../components/content/Quote';
import { Type } from '../components/primitives/Type';
import { ArrowR } from '../components/icons/ArrowR';
import { Code } from '../components/icons/Code';
import { Content } from '../components/icons/Content';
import { Organization } from '../components/icons/Organization';
import { Custom } from '../components/icons/Custom';
import { Editor } from '../components/icons/Editor';
import { Filter } from '../components/icons/Filter';
import { Pill } from '../components/content/Pill';
import { Shield } from '../components/icons/Shield';
import { Watch } from '../components/icons/Watch';
import { Cli } from '../components/icons/Cli';
import { Page } from '../components/Page';
import { IntroHeading } from '../components/content/Intro';

import adminUi from '../public/assets/admin-ui.png';

export default function WhyKeystonePage() {
  const mq = useMediaQuery();

  return (
    <Page
      title={'Why KeystoneJS'}
      description={
        'More than a backend framework, and more than a Headless CMS, discover why Keystone is the platform for next-gen development workflows and evolution.'
      }
    >
      <MWrapper>
        <IntroHeading>
          Why <Highlight look="grad2">Keystone</Highlight>
        </IntroHeading>
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
              Keystone is a <a href="https://thinkmill.com.au">Thinkmill</a> product. We’ve spent
              years shipping sophisticated solutions for large companies like Atlassian, Samsung,
              Qantas, Breville, and the Australian Government. We’ve also helped startups get off
              the ground in a way that lets them deliver immediate value and change as they learn.
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
              That’s why we built something that’s more than a backend framework, and more than a
              Headless CMS.{' '}
              <strong>It’s a platform for next-gen development workflows and evolution.</strong>
            </Type>
          </div>
        </div>

        <div
          css={{
            margin: '1rem 0',
          }}
        >
          <Image src={adminUi} alt="Depiction of Keystone’s Admin UI" width={3710} height={2195} />
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
              every time you stand up a new project.
            </Type>
          </li>
          <li>
            <Type as="h2" look="heading20bold">
              Control in the places you need it most
            </Type>
            <Type as="p" look="body18" margin="1rem 0" color="var(--muted)">
              When it’s time to customise for business logic, everything you need is at your
              fingertips. What’s not built-in won’t block you from moving forward.
            </Type>
          </li>
          <li>
            <Type as="h2" look="heading20bold">
              Escape hatches where you need them
            </Type>
            <Type as="p" look="body18" margin="1rem 0" color="var(--muted)">
              Like React, Keystone is engineered with escape hatches in mind. So you’re not locked
              in to Keystone’s way of thinking, except when it works for you.
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
          <Button as="a" href="/#how-it-works" look="soft" shadow>
            Discover how Keystone works <ArrowR />
          </Button>
        </div>

        <Quote
          name="Erwann Mest"
          title="Lead frontend engineer @contexte"
          img="/assets/_kud.jpg"
          grad="grad2"
        >
          I think I'm in love. Keystone’s just what I needed: a dashboard &amp; GraphQL API that
          works like a charm. As a frontend dev with skills in node and elastic search, Keystone +
          GraphQL just feels so right to me <Emoji symbol="❤️" alt="Love" />
        </Quote>

        <Section>
          <Type as="h2" look="heading30">
            Made for teams
          </Type>
          <Type
            as="p"
            look="body18"
            color="var(--muted)"
            css={{ maxWidth: '34rem', margin: '1rem 0' }}
          >
            It takes a village to build and nurture great digital experiences. Keystone enables a
            content culture where everybody gets what they need to do their best work.
          </Type>
          <div
            css={mq({
              display: 'grid',
              gridTemplateColumns: ['1fr', '1fr 1fr', null, '1fr 1fr 1fr'],
              gap: ['1rem', '2rem', '2.5rem', null],
              alignItems: 'stretch',
              marginTop: '2.5rem',
              '& > a': {
                borderRadius: '1rem',
                boxShadow: '0 0 5px var(--shadow)',
                padding: '1.5rem',
                color: 'var(--app-bg)',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease, padding 0.2s ease',
                textDecoration: 'none !important',
                '&:hover, &:focus': {
                  boxShadow: '0 7px 21px var(--shadow)',
                  transform: 'translateY(-4px)',
                },
                '& svg': {
                  height: '2rem',
                },
              },
            })}
          >
            <Link href="/for-developers" passHref>
              <a
                css={{
                  backgroundImage: `linear-gradient(116.01deg, var(--grad3-2), var(--grad3-1))`,
                }}
              >
                <Code />
                <Type
                  as="h2"
                  look="heading20bold"
                  css={{
                    margin: '.5rem 0 .5rem 0 !important',
                    color: 'inherit',
                  }}
                >
                  Developer Experience →
                </Type>
                <Type
                  as="p"
                  look="body18"
                  css={{
                    color: 'inherit',
                  }}
                >
                  Built the way you’d want it made. Keystone fits with the tools you know and love.
                </Type>
              </a>
            </Link>
            <Link href="/for-content-management" passHref>
              <a
                css={{
                  backgroundImage: `linear-gradient(116.01deg, var(--grad5-2), var(--grad5-1))`,
                }}
              >
                <Content />
                <Type
                  as="h2"
                  look="heading20bold"
                  css={{
                    margin: '.5rem 0 .5rem 0 !important',
                    color: 'inherit',
                  }}
                >
                  Editor Experience →
                </Type>
                <Type
                  as="p"
                  look="body18"
                  css={{
                    color: 'inherit',
                  }}
                >
                  The configurable editing environment you need to do your best work.
                </Type>
              </a>
            </Link>
            <Link href="/for-organisations" passHref>
              <a
                css={{
                  backgroundImage: `linear-gradient(116.01deg, var(--grad4-2), var(--grad4-1))`,
                }}
              >
                <Organization />
                <Type
                  as="h2"
                  look="heading20bold"
                  css={{
                    margin: '.5rem 0 .5rem 0 !important',
                    color: 'inherit',
                  }}
                >
                  For Organisations →
                </Type>
                <Type
                  as="p"
                  look="body18"
                  css={{
                    color: 'inherit',
                  }}
                >
                  Own your data. Start fast. Find your audience anywhere. Scale on your terms.
                </Type>
              </a>
            </Link>
          </div>
        </Section>

        <Section>
          <Pill grad="grad2" id="features">
            Features
          </Pill>
          <Type as="h2" look="heading48" margin="1rem 0 0 0">
            What’s in <Highlight look="grad2">the box?</Highlight>
          </Type>
          <Type
            as="p"
            look="body20"
            margin="0.5rem 0 1.5rem 0"
            color="var(--muted)"
            css={{ maxWidth: '45rem' }}
          >
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
                height: '2.5rem',
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
              <Type as="p" look="body18">
                <Link href="/docs/apis/access-control">
                  <a>Access control API →</a>
                </Link>
              </Type>
            </li>
            <li>
              <Custom grad="grad2" />
              <Type as="h3" look="heading20bold">
                Extensible GraphQL API
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                Extend the CRUD API for more control over what you do. Customise it to your frontend
                needs.
              </Type>
              <Type as="p" look="body18">
                <a
                  href="https://github.com/keystonejs/keystone/tree/main/examples/extend-graphql-schema"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Try the example →
                </a>
              </Type>
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
              <Type as="p" look="body18">
                <Link href="/docs/guides/document-field-demo">
                  <a>Try the editor →</a>
                </Link>
              </Type>
            </li>
            <li>
              <Watch grad="grad2" />
              <Type as="h3" look="heading20bold">
                Session management
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                Start and end sessions from the GraphQL API. Secure your data using access control.
              </Type>
              <Type as="p" look="body18">
                <Link href="/docs/apis/session">
                  <a>Session API →</a>
                </Link>
              </Type>
            </li>
            <li>
              <Typescript grad="grad2" />
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
              <Type as="p" look="body18">
                <Link href="/docs/apis/access-control">
                  <a>Access Control API →</a>
                </Link>
              </Type>
            </li>
            <li>
              <Relationship grad="grad2" />
              <Type as="h3" look="heading20bold">
                Flexible relationships
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                One to one. One to many. Many to many. Self referential. It’s all there.
              </Type>
              <Type as="p" look="body18">
                <Link href="/docs/guides/relationships">
                  <a>Relationships guide →</a>
                </Link>
              </Type>
            </li>
            <li>
              <Filter grad="grad2" />
              <Type as="h3" look="heading20bold">
                Powerful filtering
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                Find what you need when you need it with intuitive filters.
              </Type>
              <Type as="p" look="body18">
                <Link href="/docs/guides/filters">
                  <a>Query Filters guide →</a>
                </Link>
              </Type>
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
              <Type as="p" look="body18">
                <Link href="/docs/apis/fields">
                  <a>Fields API →</a>
                </Link>
              </Type>
            </li>
            <li>
              <Updates grad="grad2" />
              <Type as="h3" look="heading20bold">
                Event Hooks
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                Put custom logic in your data ops. Modify data, trigger events, validate inputs –
                it’s up to you.
              </Type>
              <Type as="p" look="body18">
                <Link href="/docs/guides/hooks">
                  <a>Hooks guide →</a>
                </Link>
              </Type>
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
              <Type as="p" look="body18">
                <Link href="/docs/guides/cli">
                  <a>CLI guide →</a>
                </Link>
              </Type>
            </li>
          </ul>
        </Section>

        <Quote
          name="Dinesh Pandiyan"
          title="JavaScript Developer | Thinkmill"
          img="/assets/flexdinesh.jpg"
          grad="grad2"
        >
          With Keystone I could create a new data type, custom queries and mutations, and access it
          all in a GraphQL playground in less than 15 mins. It’s so satisfying to make server-side
          changes without having to spend time on the database. Keystone is magical and I love it!
        </Quote>

        <Section>
          <Pill grad="grad2" id="solutions">
            Solutions
          </Pill>
          <Type as="h2" look="heading48" margin="1rem 0 0 0">
            What will you <Highlight look="grad2">build?</Highlight>
          </Type>
          <Type
            as="p"
            look="body20"
            margin="0.5rem 0 1.5rem 0"
            color="var(--muted)"
            css={{ maxWidth: '37.5rem' }}
          >
            Naturally, it’s up to you. Here’s some things we've used Keystone for:
          </Type>
          <ul
            css={mq({
              display: 'grid',
              gridTemplateColumns: ['1fr', '1fr 1fr'],
              gap: '3rem',
              listStyle: 'none',
              padding: 0,
              margin: ['3rem auto 0 auto', '3rem 0 0 0'],
              '& svg': {
                height: '2rem',
              },
              '& svg, & h3, & p': {
                marginBottom: '1rem',
              },
            })}
          >
            <li>
              <Type as="h3" look="heading36" id="apps">
                Apps
              </Type>
              <Type as="p" look="body18" color="var(--muted)">
                A programmable backend you can rely on for Web and Native apps of all sizes. Start
                with Keystone’s built-in features then add your own, and integrate 3rd-party systems
                or microservices.
              </Type>
              <Type as="p" look="body18" color="var(--muted)">
                You can control data input exclusively from your frontend, or use Keystone’s
                intuitive and customisable CMS when you need it.
              </Type>
              <Type as="p" look="body18">
                <a
                  href="https://github.com/keystonejs/keystone/tree/main/examples/task-manager"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Try the Task Manager example →
                </a>
              </Type>
            </li>
            <li>
              <Type as="h3" look="heading36" id="websites">
                Websites
              </Type>
              <Type as="p" look="body18" color="var(--muted)">
                From simple blog, to complex multi-brand site networks, Keystone’s the backend fit
                for modern web experiences. It’s a CMS that ships with no hard opinions, so you can
                build the fields and types you actually need. And a WYSIWIG you can plug custom
                components into, that outputs structured JSON.
              </Type>
              <Type as="p" look="body18" color="var(--muted)">
                Give your content people the tools they need to do their best work.
              </Type>
              <Type as="p" look="body18">
                <a
                  href="https://github.com/keystonejs/keystone/tree/main/examples/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Try the Blog example →
                </a>
              </Type>
            </li>
          </ul>
        </Section>

        <Section
          css={mq({
            display: 'grid',
            gridTemplateColumns: ['1fr', null, '1fr 1fr'],
            gap: '3rem',
          })}
        >
          <div>
            <Type as="h3" look="heading36" id="ecommerce">
              eCommerce
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              Keystone gives you the power and control you need to build a complete backend for
              eCommerce, while making it easy to integrate platforms like Shopify and Stripe to get
              things done. API first, make Keystone a key player in your eCommerce content mesh.
            </Type>
            <Type as="p" look="body18">
              <a
                href="https://github.com/keystonejs/keystone/tree/main/examples-staging/ecommerce"
                target="_blank"
                rel="noopener noreferrer"
              >
                Try the eCommerce example →
              </a>
            </Type>
          </div>
          <div>
            <TweetBox user="wesbos" img="/assets/wesbos-square.jpg" grad="grad2">
              I use Keystone in my{' '}
              <a
                href="https://advancedreact.com/friend/KEYSTONE"
                target="_blank"
                rel="noopener noreferrer"
              >
                Advanced React
              </a>{' '}
              course because it’s super quick to get my content types up and running, add custom
              server-side cart & checkout logic, and the fine grain access control is just
              fantastic!
            </TweetBox>
          </div>
        </Section>

        <AdvancedReactCta />

        <Section
          css={mq({
            display: 'grid',
            gridTemplateColumns: ['fr1', null, '1fr 1fr'],
            gap: '3rem',
          })}
        >
          <div>
            <Type as="h3" look="heading36" id="multichannel">
              Multichannel
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0 0 0">
              Use an API-first content platform to unlocks the power of multichannel content ops.
              Connect to your audience where they want to be. Ship content to any frontend over
              performant APIs. Use the built-in GraphQL Playground to query with ease.
            </Type>
          </div>
          <TweetBox
            user="makezap"
            img="/assets/makezap.jpg"
            grad="grad2"
            css={mq({
              gridColumn: [null, null, 1],
              gridRow: [null, null, 1],
            })}
          >
            Keystone powers my interactive photo booth and AR lottery at Chandon Winery. I love how
            easy it was to turn a series of connected prototypes into a stable final build. The
            perfect balance of reliability and flexibility for backend work.
          </TweetBox>
        </Section>
        <EndCta grad="grad2" />
      </MWrapper>
    </Page>
  );
}
