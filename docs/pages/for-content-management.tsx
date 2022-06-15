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

import dsGeneration from '../public/assets/ds-generation.png';
import contentManagement1 from '../public/assets/content-management-1.png';
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
        <Pill grad="grad5">Keystone for content management</Pill>
        <IntroWrapper>
          <IntroHeading>
            The content interface <Highlight look="grad5">for your codebase</Highlight>
          </IntroHeading>
          <IntroLead>
            Control the story without changing lanes: Keystone's Admin UI is a natural extension of
            how you work in code, and has the flexibility you need to enable content creatives.
          </IntroLead>
        </IntroWrapper>
        <Button
          as="a"
          href="/docs/guides/document-fields"
          css={{ marginTop: '2rem' }}
          size="large"
          shadow
        >
          Try the Rich Text demo <ArrowR />
        </Button>

        <SideBySideSection reverse>
          <div>
            <Type as="h2" look="heading48">
              Permissions you can <Highlight look="grad5">make your own.</Highlight>
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              No compromises when it comes to user access. Keystone lets you control 100% of your
              CRUD ops in all the places where you need them.
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
                <Tick grad="grad5" />
                <Type look="body18" color="var(--muted)">
                  Custom roles for unique teams
                </Type>
              </li>
              <li>
                <Tick grad="grad5" />
                <Type look="body18" color="var(--muted)">
                  Tailor CRUD for every field
                </Type>
              </li>
              <li>
                <Tick grad="grad5" />
                <Type look="body18" color="var(--muted)">
                  Secure your content ops
                </Type>
              </li>
            </ul>
            <Type as="p" look="body18">
              <Link href="/docs/apis/access-control">
                <a>Access control API →</a>
              </Link>
            </Type>
          </div>
          <div>
            <Image
              src={contentManagement1}
              alt="Dropdown selector from Keystone’s Admin UI showing different user roles: Administrator, Editor, Content Manager, Author"
              width={1884}
              height={1161}
            />
          </div>
        </SideBySideSection>
        <Quote
          name="Wes Bos"
          img="/assets/wesbos-square.jpg"
          title="Javascript developer. Host of Syntax.FM podcast."
          grad="grad5"
        >
          I love how Keystone’s access control lets me declare every single Create, Read, Update,
          and Delete operation at both the <strong>model</strong> and <strong>field</strong> level.
          It’s my favorite way of implementing Auth.
        </Quote>

        <SideBySideSection>
          <div>
            <Type as="h2" look="heading48">
              Fields fit for <Highlight look="grad5">purpose.</Highlight>
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              Keystone comes with an extensive fields API out of the box, and an easy GraphQL
              endpoint for every field you make.
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
                <Tick grad="grad5" />
                <Type look="body18" color="var(--muted)">
                  Easy labels & descriptions
                </Type>
              </li>
              <li>
                <Tick grad="grad5" />
                <Type look="body18" color="var(--muted)">
                  Extensive Scalar types
                </Type>
              </li>
              <li>
                <Tick grad="grad5" />
                <Type look="body18" color="var(--muted)">
                  Custom & virtual options
                </Type>
              </li>
            </ul>
            <Type as="p" look="body18">
              <Link href="/docs/apis/fields">
                <a>Fields API →</a>
              </Link>
            </Type>
          </div>
          <div>
            <Image
              src={contentManagement2}
              alt="Overlay of Admin UI field panes showing fields for a Post content type. Promotional text overlays show: custom and virtual fields; flexible relationships; powerful sort & filtering."
              width={1878}
              height={1561}
            />
          </div>
        </SideBySideSection>

        <Section>
          <div
            css={mq({
              display: 'grid',
              gridTemplateColumns: ['1fr', null, '1fr 1fr'],
              gap: '2rem',
              alignItems: 'center',
            })}
          >
            <div>
              <Type as="h2" look="heading48">
                A rich text experience for the{' '}
                <Highlight look="grad5">design system generation.</Highlight>
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                Keystone’s Document field is the first of its kind: intuitive, customisable, and
                works with your design system components. Make it as lean or full-featured as you
                like. It‘s up to you.
              </Type>
              <Button
                as="a"
                // look="soft"
                size="large"
                href="/docs/guides/document-field-demo"
                css={{ margin: '1.5rem 1rem 1rem 0' }}
              >
                Try the demo <ArrowR />
              </Button>
              <Type look="body18">
                <Link href="/docs/guides/document-fields">
                  <a>Read the guide →</a>
                </Link>
              </Type>
            </div>
            <div>
              <Image
                src={dsGeneration}
                alt="Keystone Document field containing Rich Text content including Twitter embed components, and syntax highlighted code block"
                width={1854}
                height={1535}
              />
            </div>
          </div>
          <ul
            css={mq({
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              marginTop: '5rem',
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
                Customisable interface
              </Type>
              <Type as="p" look="body18" margin="1rem 0" color="var(--muted)">
                Every rich text field instance is what you make it. Control what's possible
                depending on what you need to do.
              </Type>
            </li>
            <li>
              <Type as="h2" look="heading20bold">
                BYO Design System components
              </Type>
              <Type as="p" look="body18" margin="1rem 0" color="var(--muted)">
                Embed layout components, social cards, and relationships to other content with your
                own React components.
              </Type>
            </li>
            <li>
              <Type as="h2" look="heading20bold">
                Preview embeds
              </Type>
              <Type as="p" look="body18" margin="1rem 0" color="var(--muted)">
                Give your editors a sense of how things will look with preview functionality in
                place as they write.
              </Type>
            </li>
            <li>
              <Type as="h2" look="heading20bold">
                Structured JSON output
              </Type>
              <Type as="p" look="body18" margin="1rem 0" color="var(--muted)">
                Access the storytelling capabilities of a WYSIWYG without losing content integrity.
                It's queryable JSON all the way down.
              </Type>
            </li>
          </ul>
        </Section>

        <Quote
          name="Max Stoiber"
          img="/assets/mxstbr.jpg"
          title="Co-Founder Graph CDN. Formerly GatsbyJS & Github."
          grad="grad5"
        >
          The new @KeystoneJS rich text editor has incredible inline React component support,
          including editing props and everything!
        </Quote>

        <SideBySideSection>
          <div>
            <Type as="h2" look="heading48">
              Relate while <Highlight look="grad5">you create.</Highlight>
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              Create relationships as you write to get your stories to market faster. No more
              context switching when designing structured content.
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
                <Tick grad="grad5" />
                <Type look="body18" color="var(--muted)">
                  Extensive relationships & cardinalities
                </Type>
              </li>
              <li>
                <Tick grad="grad5" />
                <Type look="body18" color="var(--muted)">
                  Self referencing options
                </Type>
              </li>
              <li>
                <Tick grad="grad5" />
                <Type look="body18" color="var(--muted)">
                  Design for queries as you code
                </Type>
              </li>
            </ul>
            <Type as="p" look="body18">
              <Link href="/docs/guides/relationships">
                <a>Relationships guide →</a>
              </Link>
            </Type>
          </div>
          <div>
            <Image
              src={contentManagement3}
              alt="2 Admin UI panes showing creation of relationships in place. Author window opens up a Create Post window where Post categories can be selected."
              width={2006}
              height={1726}
            />
          </div>
        </SideBySideSection>

        <SideBySideSection reverse>
          <div>
            <Type as="h2" look="heading48">
              Manage complexity
              <br /> {/* This <br /> needs to be there to fix a horrible safari bug, sadface */}
              <Highlight look="grad5">on your terms.</Highlight>
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              The Keystone Admin UI has great tooling for managing complex sets of content, so
              editors can intuitively understand the data they're editing.
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
                <Tick grad="grad5" />
                <Type look="body18" color="var(--muted)">
                  Only see what’s most relevant
                </Type>
              </li>
              <li>
                <Tick grad="grad5" />
                <Type look="body18" color="var(--muted)">
                  Default sort & filtering
                </Type>
              </li>
              <li>
                <Tick grad="grad5" />
                <Type look="body18" color="var(--muted)">
                  Custom views for fields
                </Type>
              </li>
            </ul>
          </div>
          <div>
            <Image
              src={contentManagement4}
              alt="Admin UI browser window showing a tabular a list of Articles with filtration applied to the list. Filter by published status."
              width={1827}
              height={1516}
            />
          </div>
        </SideBySideSection>

        <EndCta grad="grad5" />
      </MWrapper>
    </Page>
  );
}
