/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Image from 'next/image';
import Link from 'next/link';

import { useMediaQuery } from '../lib/media';
import { CodeWindow, WindowWrapper, WindowL, WindowR } from '../components/content/CodeWindow';
import { IntroWrapper, IntroHeading, IntroLead } from '../components/content/Intro';
import { CommunityCta } from '../components/content/CommunityCta';
import { FrontEndLogos } from '../components/icons/FrontEndLogos';
import { Organization } from '../components/icons/Organization';
import { Highlight } from '../components/primitives/Highlight';
import { WhyKeystone } from '../components/icons/WhyKeystone';
import { MWrapper } from '../components/content/MWrapper';
import { Relational } from '../components/icons/Relational';
import { TweetBox } from '../components/content/TweetBox';
import { Typescript } from '../components/icons/Typescript';
import { Code as SourceCode, InlineCode } from '../components/primitives/Code';
import { Automated } from '../components/icons/Automated';
import { Section } from '../components/content/Section';
import { Thinkmill } from '../components/icons/Thinkmill';
import { CodeBox } from '../components/content/CodeBox';
import { Migration } from '../components/icons/Migration';
import { Button } from '../components/primitives/Button';
import { EndCta } from '../components/content/EndCta';
import { Emoji } from '../components/primitives/Emoji';
import { Content } from '../components/icons/Content';
import { Updates } from '../components/icons/Updates';
import { Type } from '../components/primitives/Type';
import { ArrowR } from '../components/icons/ArrowR';
import { Custom } from '../components/icons/Custom';
import { Filter } from '../components/icons/Filter';
import { Shield } from '../components/icons/Shield';
import { Watch } from '../components/icons/Watch';
import { Code } from '../components/icons/Code';
import { Tick } from '../components/icons/Tick';
import { Page } from '../components/Page';

import contentEditorMockui from '../public/assets/content-editor-mockui.png';
import docEditorHome from '../public/assets/doc-editor-home.png';
import deployTargets from '../public/assets/deploy-targets.png';

export default function IndexPage() {
  const mq = useMediaQuery();
  return (
    <Page
      title={'KeystoneJS: The superpowered Node.js Headless CMS for developers'}
      description={
        'Build faster and scale further with the programmable open source GraphQL API back-end for structured content projects.'
      }
    >
      <MWrapper>
        <IntroWrapper>
          <IntroHeading>
            The <Highlight look="grad1">superpowered</Highlight> CMS for developers
          </IntroHeading>
          <IntroLead>
            Keystone helps you build faster and scale further than any other CMS or App Framework.
            Just describe your schema, and get a powerful GraphQL API & beautiful Management UI for
            content and data.
          </IntroLead>
          <IntroLead>
            No boilerplate or bootstrapping – just elegant APIs to help you ship the code that
            matters without sacrificing the flexibility or power of a bespoke back-end.
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
        </div>

        <Section
          css={mq({
            display: 'grid',
            gridTemplateColumns: ['1fr', null, '0.85fr 1.15fr'],
            gap: ['1rem', '2rem', '6rem'],
          })}
        >
          <div>
            <Type as="h2" look="body20bold" color="var(--text-heading)" margin="0 0 1.5rem 0">
              A Thinkmill product
            </Type>
            <div
              css={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '1rem',
              }}
            >
              <Type as="p" look="body18">
                We're an Australian design + development consultancy with a long history working on
                big products at scale for names you know. <br css={{ padding: '0 0 2rem 0' }} />
                <Link href="/why-keystone">
                  <a>Why we built Keystone</a>
                </Link>
              </Type>
              <Thinkmill css={{ height: '3.75rem' }} />
            </div>
          </div>
          <div>
            <Type as="h2" look="body20bold" color="var(--text-heading)" margin="0 0 1.5rem 0">
              Open Source & trusted
            </Type>
            <ul
              css={mq({
                listStyle: 'none',
                margin: '0 auto',
                padding: 0,
                display: 'grid',
                gridTemplateColumns: 'max-content',
                gap: '1.5rem',
                width: '7.5rem',
                '@media(min-width: 420px)': {
                  gridTemplateColumns: 'auto auto auto',
                  width: 'auto',
                  gap: 0,
                },
              })}
            >
              <li>
                <Type as="h3" look="heading48">
                  <Highlight look="grad1">1m+</Highlight>
                </Type>
                <Type as="p" look="body18">
                  <InlineCode>npm</InlineCode> Installs
                </Type>
              </li>
              <li>
                <Type as="h3" look="heading48">
                  <Highlight look="grad1">160+</Highlight>
                </Type>
                <Type as="p" look="body18">
                  Contributors
                </Type>
              </li>
              <li>
                <Type as="h3" look="heading48">
                  <Highlight look="grad1">2013</Highlight>
                </Type>
                <Type as="p" look="body18">
                  First Commit
                </Type>
              </li>
            </ul>
          </div>
        </Section>

        <Section
          css={mq({
            display: 'grid',
            gridTemplateColumns: ['1fr', null, '1fr 1fr 1fr'],
            alignItems: 'flex-start',
            gap: '3rem',
          })}
        >
          <TweetBox user="mxstbr" img="/assets/mxstbr.jpg" grad="grad2">
            When I'm building an app or site, Keystone is the backend I'd use ten times out of ten.
            So impressive what the team have done in version 6! ...and it works perfectly with
            GraphCDN, just use it already!
          </TweetBox>
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
            server-side cart & checkout logic, and the fine grain access control is just fantastic!
          </TweetBox>
          <TweetBox user="simonswiss" img="/assets/simonswiss.jpg" grad="grad2">
            As someone who lives on the frontend, I love how Keystone lets me define content models
            and gives me the backend I need. I get a sweet GraphQL API, and can stay focused on
            building the UI <Emoji symbol="😍" alt="Love" />
          </TweetBox>
        </Section>

        <Section>
          <Type as="h2" look="heading48">
            Batteries included. <Highlight look="grad5">No limitations.</Highlight>
          </Type>
          <Type as="p" look="body20" color="var(--muted)" margin="0.5rem 0 1.5rem 0">
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
                height: '3rem',
                marginBottom: '0.5rem',
              },
            })}
          >
            <li>
              <WhyKeystone grad="grad5" />
              <Type as="p" look="body18" color="var(--muted)">
                All the field types
              </Type>
            </li>
            <li>
              <Shield grad="grad5" />
              <Type as="p" look="body18" color="var(--muted)">
                Access Control
              </Type>
            </li>
            <li>
              <Watch grad="grad5" />
              <Type as="p" look="body18" color="var(--muted)">
                Session Management
              </Type>
            </li>
            <li>
              <Custom grad="grad5" />
              <Type as="p" look="body18" color="var(--muted)">
                Custom Schema
              </Type>
            </li>
            <li>
              <Migration grad="grad5" />
              <Type as="p" look="body18" color="var(--muted)">
                Database Migrations
              </Type>
            </li>
            <li>
              <Typescript grad="grad5" />
              <Type as="p" look="body18" color="var(--muted)">
                TypeScript Support
              </Type>
            </li>
            <li>
              <Filter grad="grad5" />
              <Type as="p" look="body18" color="var(--muted)">
                Powerful Filters
              </Type>
            </li>
            <li>
              <Relational grad="grad5" />
              <Type as="p" look="body18" color="var(--muted)">
                Relational Data
              </Type>
            </li>
            <li>
              <Automated grad="grad5" />
              <Type as="p" look="body18" color="var(--muted)">
                Automated CRUD
              </Type>
            </li>
            <li>
              <Updates grad="grad5" />
              <Type as="p" look="body18" color="var(--muted)">
                Event Hooks
              </Type>
            </li>
          </ul>
          <Button as="a" href="/why-keystone#features" shadow css={{ marginTop: '4rem' }}>
            See all features <ArrowR />
          </Button>
        </Section>

        <Section>
          <Type as="h2" look="heading48" id="how-it-works">
            How it works
          </Type>
          <Type as="p" look="body20" color="var(--muted)" margin="0.5rem 0 1.5rem 0">
            Enable a content culture that’s productive, collaborative, and fun.
            <br />
            Open, flexible, and natural. A tool your team can grow with.
          </Type>
        </Section>

        <ol
          css={mq({
            listStyle: 'none',
            padding: 0,
            margin: '5rem 0 0 0',
            '& > li': {
              display: 'grid',
              gridTemplateColumns: ['1fr', null, '0.8fr 1.2fr'],
              position: 'relative',
              gap: '3rem',
              paddingTop: ['3rem', '5rem'],
              ':after': {
                content: '""',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '1.55rem',
                width: '2px',
                background: 'var(--border)',
                zIndex: -2,
              },
            },
            '& > li > div:first-of-type': {
              position: 'relative',
              marginLeft: '4.75rem',
              marginTop: '3rem',
              ':before': {
                content: '"1"',
                position: 'absolute',
                left: '-4.75rem',
                top: '-.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 900,
                color: 'var(--app-bg)',
                width: '3.125rem',
                height: '3.125rem',
                background: 'linear-gradient(to right, var(--grad2-1), var(--grad2-2))',
                boxShadow: '0 0 0 0.5rem var(--app-bg)',
                borderRadius: '100%',
                zIndex: 3,
              },
              ':after': {
                content: '""',
                position: 'absolute',
                left: '-4.75rem',
                top: '-.85rem',
                width: '2.625rem',
                height: '2.625rem',
                margin: '0.25rem',
                border: '3px solid var(--app-bg)',
                borderRadius: '100%',
                zIndex: 4,
              },
            },
          })}
        >
          <li
            css={{
              paddingTop: '0 !important',
              ':before': {
                content: '""',
                position: 'absolute',
                top: 0,
                height: '4rem',
                left: '1.2rem',
                width: '0.5rem',
                background: 'var(--app-bg)',
                zIndex: -1,
              },
            }}
          >
            <div>
              <Type as="h3" look="heading24">
                Design your schema
              </Type>
              <Type as="p" look="body18" margin="1rem 0 0 0">
                Rapidly spec your backend with all the primitive and advanced field types you need.
              </Type>
              <Type as="p" look="body18">
                Add logic, access control, and custom queries & mutations to create an API that's
                unique to your app.
              </Type>
              <ul
                css={{
                  listStyle: 'none',
                  margin: '1rem 0 0 0',
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
                  <Tick grad="grad2" />
                  <Type look="body18">100% TypeScript (or JavaScript)</Type>
                </li>
                <li>
                  <Tick grad="grad2" />
                  <Type look="body18">Fits your git-based workflow & CI</Type>
                </li>
                <li>
                  <Tick grad="grad2" />
                  <Type look="body18">Automatic db migrations with Prisma</Type>
                </li>
              </ul>
            </div>
            <div>
              <CodeWindow lines={21}>
                <WindowL>
                  <SourceCode>
                    {`import { list } from '@keystone-next/keystone';
import { document, text, timestamp, password, relationship } from '@keystone-next/keystone/fields';

export const lists = {
  Post: list({
    fields: {
      title: text({ isRequired: true }),
      content: document(),
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.posts', many: false }),
    },
  }),
  Author: list({
    fields: {
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isIndexed: 'unique' }),
      password: password(),
      posts: relationship({ ref: 'Post.author', many: true }),
    },
  }),
};`}
                  </SourceCode>
                </WindowL>
              </CodeWindow>
            </div>
          </li>
          <li>
            <div
              css={{
                '&&&:before': {
                  content: '"2"',
                  background: 'linear-gradient(to right, var(--grad3-1), var(--grad3-2))',
                },
              }}
            >
              <Type as="h3" look="heading24">
                Customise your content story
              </Type>
              <Type as="p" look="body18" margin="1rem 0 0 0">
                A flexible and intuitive editing environment that does what your schema says:
                Keystone’s Admin UI understands your access control, so you can shape it to your
                unique needs.
              </Type>
              <ul
                css={{
                  listStyle: 'none',
                  margin: '1rem 0 0 0',
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
                  <Type look="body18">Powerful access control</Type>
                </li>
                <li>
                  <Tick grad="grad3" />
                  <Type look="body18">Next-gen rich text WYSIWYG</Type>
                </li>
                <li>
                  <Tick grad="grad3" />
                  <Type look="body18">BYO custom React components </Type>
                </li>
              </ul>
            </div>
            <div>
              <Image
                src={contentEditorMockui}
                alt="Overlay of Admin UI field panes showing fields for a Post content type. Promotional text overlays show: custom & virtual fields; flexible relationships; powerful sort & filtering."
                width={2109}
                height={1591}
              />
            </div>
          </li>
          <li>
            <div
              css={{
                '&&&:before': {
                  content: '"3"',
                  background: 'linear-gradient(to right, var(--grad5-1), var(--grad5-2))',
                },
              }}
            >
              <Type as="h3" look="heading24">
                Query your data
              </Type>
              <Type as="p" look="body18" margin="1rem 0 0 0">
                Get what you need, fast. Keystone's GraphQL API gives you session management, access
                control, pagination, sorting, and filtering out of the box. Customise it without
                losing the bits that work for you.
              </Type>
              <ul
                css={{
                  listStyle: 'none',
                  margin: '1rem 0 0 0',
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
                  <Tick grad="grad5" />
                  <Type look="body18">Powerful CRUD scaffolding</Type>
                </li>
                <li>
                  <Tick grad="grad5" />
                  <Type look="body18">Evolve with bespoke logic for your app</Type>
                </li>
                <li>
                  <Tick grad="grad5" />
                  <Type look="body18">Integrate microservices & external APIs</Type>
                </li>
              </ul>
            </div>
            <div>
              <CodeWindow lines={18}>
                <WindowWrapper>
                  <WindowL>
                    <SourceCode>
                      {`{
  posts(take: 2, where: {
    title: { contains: "content" }
  }) {
    title
    author {
      name
    }
  }
}`}
                    </SourceCode>
                  </WindowL>
                  <WindowR>
                    <SourceCode>
                      {`{
  "data": {
    "posts": [
      {
        "title": "How structured content gives you superpowers",
        "author": {
          "name": "Tim"
        }
      },
      {
        "title": "Content Management for the Design System generation",
        "author": {
          "name": "Lauren"
        }
      }
    ]
  }
}`}
                    </SourceCode>
                  </WindowR>
                </WindowWrapper>
              </CodeWindow>
            </div>
          </li>
          <li
            css={mq({
              ':before': {
                content: '""',
                position: 'absolute',
                top: 0,
                height: ['7rem', '9rem', null, null],
                left: '1.55rem',
                width: '2px',
                background: 'var(--border)',
                zIndex: -1,
              },
              ':after': {
                display: 'none',
              },
            })}
          >
            <div
              css={{
                '&&&:before': {
                  content: '"4"',
                  background: 'linear-gradient(to right, var(--grad1-1), var(--grad1-2))',
                },
              }}
            >
              <Type as="h3" look="heading24">
                Deploy anywhere
              </Type>
              <Type as="p" look="body18" margin="1rem 0 0 0">
                Keystone is open source. Deploy it to managed services like Digital Ocean, Heroku,
                and Render, or your own custom infrastructure.
              </Type>
              <Type as="p" look="body18" margin="1rem 0 0 0">
                The source of truth is your codebase, so Keystone fits naturally into your git-based
                development workflow, and you can use all the CI & Automation tooling you already
                know.
              </Type>
            </div>
            <div>
              <Image
                src={deployTargets}
                alt="Deploy targets for Keystone are any and all services you've heard of like Digital Ocean, Render, Heroku, Vercel, Google Cloud, AWS, Azure etc"
                width={1896}
                height={1339}
              />
            </div>
          </li>
        </ol>

        <Section
          css={{
            textAlign: 'center',
          }}
        >
          <Type as="h2" look="heading48" margin="0 auto">
            Built for the <Highlight look="grad2">modern ecosystem</Highlight>
          </Type>
          <Type
            as="p"
            look="body20"
            color="var(--muted)"
            css={{
              display: 'block',
              maxWidth: '34.25rem',
              margin: '1rem auto',
            }}
          >
            Access your content from any frontend framework or distribution channel. Build static
            sites, dynamic apps, commerce experiences and more for web and mobile with the tools you
            find most productive.
          </Type>
          <FrontEndLogos
            css={{
              display: 'inline-block',
              maxWidth: '48.125rem',
              opacity: 0.5,
              color: 'var(--muted)',
              margin: '2rem 0',
            }}
          />
          <Type as="h3" look="body18bold" margin="1rem auto">
            Keystone for:
          </Type>
          <ul
            css={{
              listStyle: 'none',
              margin: '1rem 0 0 0',
              padding: 0,
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <li>
              <Button as="a" href="/why-keystone#apps" look="soft" size="large" shadow>
                Apps <ArrowR />
              </Button>
            </li>
            <li>
              <Button as="a" href="/why-keystone#websites" look="soft" size="large" shadow>
                Websites <ArrowR />
              </Button>
            </li>
            <li>
              <Button as="a" href="/why-keystone#ecommerce" look="soft" size="large" shadow>
                eCommerce <ArrowR />
              </Button>
            </li>
            <li>
              <Button as="a" href="/why-keystone#multichannel" look="soft" size="large" shadow>
                Multichannel <ArrowR />
              </Button>
            </li>
          </ul>
        </Section>

        <Section
          css={{
            textAlign: 'center',
          }}
        >
          <Type as="h2" look="heading30" margin="2rem auto" css={{ maxWidth: '41.875rem' }}>
            What makes Keystone a CMS for the Design System generation?
          </Type>
          <Button as="a" href="/docs/guides/document-field-demo" shadow>
            See our new document editor <ArrowR />
          </Button>
          <div
            css={{
              marginTop: '4rem',
              borderBottom: '1px solid var(--border)',
              '& > div': {
                display: 'block !important',
                lineHeight: 1,
                padding: 0,
                margin: 0,
              },
              img: {
                // TODO: crop the bottom border out of the image, then remove this
                bottom: '-5px !important',
              },
            }}
          >
            <Image
              src={docEditorHome}
              alt="Browser window of the Keystone Document Field showing demo text explaining how the field can be used."
              width={3183}
              height={731}
            />
          </div>
        </Section>

        <Section>
          <Type as="h2" look="heading48">
            Unify your <Highlight look="grad3">team dynamic</Highlight>
          </Type>
          <Type
            as="p"
            look="body20"
            margin="0.5rem 0 1.5rem 0"
            color="var(--muted)"
            css={{ maxWidth: '37.5rem' }}
          >
            Enable a content culture that’s productive, collaborative, and fun. Open, flexible, and
            natural. A tool your team can grow with.
          </Type>
          <ul
            css={mq({
              display: 'grid',
              gridTemplateColumns: ['1fr', '1fr 1fr 1fr'],
              gap: '3rem',
              listStyle: 'none',
              padding: 0,
              margin: ['3rem auto 0 auto', '3rem 0 0 0'],
              maxWidth: ['20rem', 'none'],
              '& svg': {
                height: '3rem',
              },
              '& svg, & h3, & p': {
                marginBottom: '1rem',
              },
            })}
          >
            <li>
              <Code grad="grad3" />
              <Type as="h3" look="heading24">
                Developers
              </Type>
              <Type as="p" look="body18" color="var(--muted)">
                Backend superpowers for frontend devs. Built the way you’d want it made, Keystone is
                at home with the tools you know and love.
              </Type>
              <Type as="p" look="body18">
                <Link href="/for-developers">
                  <a>Keystone for Developers →</a>
                </Link>
              </Type>
            </li>
            <li>
              <Content grad="grad3" />
              <Type as="h3" look="heading24">
                Content people
              </Type>
              <Type as="p" look="body18" color="var(--muted)">
                Get the fields, forms, and workflows you need to do your best work. Tell the full
                story with a rich text editor that can be configured for any content need.
              </Type>
              <Type as="p" look="body18">
                <Link href="/for-content-management">
                  <a>Keystone for Content Management →</a>
                </Link>
              </Type>
            </li>
            <li>
              <Organization grad="grad3" />
              <Type as="h3" look="heading24">
                Organisations
              </Type>
              <Type as="p" look="body18" color="var(--muted)">
                Realise your vision with a backend you can shape to fit your logic. Own your data,
                cultivate a productive content culture, send your message anywhere, and scale on
                your terms.
              </Type>
              <Type as="p" look="body18">
                <Link href="/for-organisations">
                  <a>Keystone for Organisations →</a>
                </Link>
              </Type>
            </li>
          </ul>
        </Section>

        <CommunityCta />

        <EndCta grad="grad4" />
      </MWrapper>
    </Page>
  );
}
