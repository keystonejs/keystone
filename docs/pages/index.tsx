/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Image from 'next/image';

import { useMediaQuery } from '../lib/media';
import { CodeWindow, WindowWrapper, WindowL, WindowR } from '../components/marketing/CodeWindow';
import { IntroWrapper, IntroHeading, IntroLead } from '../components/marketing/Intro';
import { FrontEndLogos } from '../components/icons/FrontEndLogos';
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
import { Tick } from '../components/icons/Tick';
import { Lab } from '../components/icons/Lab';
import { Page } from '../components/Page';

import contentEditorMockui from '../public/assets/content-editor-mockui.png';
import docEditorHome from '../public/assets/doc-editor-home.png';
import deployTargets from '../public/assets/deploy-targets.png';
import communityMap from '../public/assets/community-map.png';

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

        <ol
          css={mq({
            listStyle: 'none',
            padding: 0,
            margin: '5rem 0 0 0',
            '& > li': {
              display: 'grid',
              gridTemplateColumns: ['1fr', null, '0.8fr 1.2fr'],
              position: 'relative',
              gap: '2rem',
              paddingTop: ['3rem', '5rem', null, '12.5rem'],
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
              marginTop: '4rem',
              ':before': {
                content: '"1"',
                position: 'absolute',
                left: '-4.75rem',
                top: 0,
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
                top: 0,
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
              <Type as="p" look="body18" margin="1rem 0 0 0" color="var(--muted)">
                Rapidly spec your backend with all the primitive and advanced field types you need.
              </Type>
              <Type as="p" look="body18" color="var(--muted)">
                Add logic, access control, and custom queries & mutations to create an API that's
                unique to your app.
              </Type>
              <ul
                css={{
                  listStyle: 'none',
                  margin: '1rem 0 0 0',
                  padding: 0,
                  '& svg': {
                    height: '1rem',
                    marginRight: '0.75rem',
                  },
                }}
              >
                <li>
                  <Tick grad="grad2" />
                  <Type look="body18" color="var(--muted)">
                    100% TypeScript (or JavaScript)
                  </Type>
                </li>
                <li>
                  <Tick grad="grad2" />
                  <Type look="body18" color="var(--muted)">
                    Fits your git-based workflow & CI
                  </Type>
                </li>
                <li>
                  <Tick grad="grad2" />
                  <Type look="body18" color="var(--muted)">
                    Automatic db migrations with Prisma
                  </Type>
                </li>
              </ul>
            </div>
            <div>
              <CodeWindow lines={21}>
                <WindowL>
                  {`import { createSchema, list } from '@keystone-next/keystone/schema';
import { relationship, text, timestamp, password } from '@keystone-next/fields';

export const lists = createSchema({
  Post: list({
    fields: {
      title: text({ isRequired: true }),
      content: text(),
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.posts', many: false }),
    },
  }),
  Author: list({
    fields: {
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isUnique: true }),
      password: password(),
      posts: relationship({ ref: 'Post.author', many: true }),
    },
  }),
});`}
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
                Customize your content story
              </Type>
              <Type as="p" look="body18" margin="1rem 0 0 0" color="var(--muted)">
                A flexible and intuitive editing environent that does what your schema says:
                Keystone’s Admin UI understands your access control, so you can shape it to your
                unique needs.
              </Type>
              <ul
                css={{
                  listStyle: 'none',
                  margin: '1rem 0 0 0',
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
                    Powerful access control
                  </Type>
                </li>
                <li>
                  <Tick grad="grad3" />
                  <Type look="body18" color="var(--muted)">
                    Next-gen rich text WYSIWYG
                  </Type>
                </li>
                <li>
                  <Tick grad="grad3" />
                  <Type look="body18" color="var(--muted)">
                    BYO custom React components{' '}
                  </Type>
                </li>
              </ul>
            </div>
            <div>
              <Image
                src={contentEditorMockui}
                alt="Content Editor Mock UI"
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
              <Type as="p" look="body18" margin="1rem 0 0 0" color="var(--muted)">
                Get what you need, fast. Keystone's GraphQL API gives you session management, access
                control, pagination, sorting, and filtering out of the box. Customize it without
                losing the bits that work for you.
              </Type>
              <ul
                css={{
                  listStyle: 'none',
                  margin: '1rem 0 0 0',
                  padding: 0,
                  '& svg': {
                    height: '1rem',
                    marginRight: '0.75rem',
                  },
                }}
              >
                <li>
                  <Tick grad="grad5" />
                  <Type look="body18" color="var(--muted)">
                    Powerful CRUD scaffolding
                  </Type>
                </li>
                <li>
                  <Tick grad="grad5" />
                  <Type look="body18" color="var(--muted)">
                    Evolve with bespoke logic for your ap
                  </Type>
                </li>
                <li>
                  <Tick grad="grad5" />
                  <Type look="body18" color="var(--muted)">
                    Integrate microservices & external APIs
                  </Type>
                </li>
              </ul>
            </div>
            <div>
              <CodeWindow lines={18}>
                <WindowWrapper>
                  <WindowL>
                    {`{
  allPosts (first: 2, where: { title_contains: "content" }) {
    title
    author {
      name
    }
  }
}`}
                  </WindowL>
                  <WindowR>
                    {`{
  "data": {
    "allPosts": [
      {
        "title": "Why structured content content  benefits of structured",
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
                height: ['7rem', '9rem', null, '16.5rem'],
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
              <Type as="p" look="body18" margin="1rem 0 0 0" color="var(--muted)">
                Keystone is open source. Deploy it to managed services like Digital Ocean, Heroku,
                and Render, or your own custom infrastructure.
              </Type>
              <Type as="p" look="body18" margin="1rem 0 0 0" color="var(--muted)">
                The source of truth is your codebase, so Keystone fits naturally into your git-based
                development workflow, and you can use all the CI & Automation tooling you already
                know.
              </Type>
            </div>
            <div>
              <Image
                src={deployTargets}
                alt="Deploy targets for Keystone are any and all services you've heard of like Digital Ocean, Render, Heroku, Vercel, Google Cloud, AWS, Azure etc"
                width={1897}
                height={1249}
              />
            </div>
          </li>
        </ol>

        <section
          css={{
            marginTop: '6.25rem',
            textAlign: 'center',
          }}
        >
          <FrontEndLogos
            css={{
              display: 'inline-block',
              height: '2rem',
              opacity: 0.5,
              margin: '1rem 0',
            }}
          />
          <Type as="h2" look="heading48" margin="0 auto">
            Built for the <Highlight look="grad2">modern ecosystem</Highlight>
          </Type>
          <Type
            as="p"
            look="body20"
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
              gap: '1rem',
              flexWrap: 'wrap',
              '& > li': {
                display: 'inline-block',
                padding: 0,
              },
            }}
          >
            <li>
              <Button as="a" href="/why-keystone#apps" look="soft">
                Apps <ArrowR />
              </Button>
            </li>
            <li>
              <Button as="a" href="/TODO" look="soft">
                Websites <ArrowR />
              </Button>
            </li>
            <li>
              <Button as="a" href="/TODO" look="soft">
                eCommerce <ArrowR />
              </Button>
            </li>
            <li>
              <Button as="a" href="/TODO" look="soft">
                Multichannel <ArrowR />
              </Button>
            </li>
          </ul>
        </section>

        <section
          css={{
            marginTop: '6.25rem',
            textAlign: 'center',
          }}
        >
          <Type as="h2" look="heading30" margin="2rem auto" css={{ maxWidth: '41.875rem' }}>
            What makes Keystone a CMS for the Design System generation?
          </Type>
          <Button as="a" href="/docs/guides/document-fields#try-the-demo">
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
            }}
          >
            <Image
              src={docEditorHome}
              alt="Deploy targets for Keystone are any and all services you've heard of like Digital Ocean, Render, Heroku, Vercel, Google Cloud, AWS, Azure etc"
              width={2718}
              height={719}
            />
          </div>
        </section>
      </MWrapper>
    </Page>
  );
}
