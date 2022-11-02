/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { CommunitySlackCTA } from '../../components/docs/CommunitySlackCTA';
import { Keystone5DocsCTA } from '../../components/docs/Keystone5DocsCTA';
import { Examples } from '../../components/docs/ExamplesList';
import { Walkthroughs } from '../../components/docs/WalkthroughsList';
import { Type } from '../../components/primitives/Type';
import { Well } from '../../components/primitives/Well';
import { DocsPage } from '../../components/Page';
import { useMediaQuery } from '../../lib/media';
import { CommunityCta } from '../../components/content/CommunityCta';
import { Content } from '../../components/icons/Content';
import { Code } from '../../components/icons/Code';
import { Bulb } from '../../components/icons/Bulb';
import { Video } from '../../components/icons/Video';
import { Organization } from '../../components/icons/Organization';

export default function Docs() {
  const mq = useMediaQuery();

  return (
    <DocsPage
      noRightNav
      noProse
      title={'Keystone Docs Home'}
      description={'Developer docs for KeystoneJS: The superpowered headless CMS for developers.'}
      isIndexPage
    >
      <Type as="h1" look="heading64">
        Developer Docs
      </Type>

      <Keystone5DocsCTA />
      <CommunitySlackCTA />

      <Type as="h2" look="heading30" margin="0 0 1rem 0">
        The Keystone Experience
      </Type>
      <div>
        <Type as="p" look="body18" css={{ maxWidth: '90ch', margin: '0 0 1.25rem' }}>
          Discover the vision behind Keystone and what it's like to work with. If you’ve just heard
          of Keystone, start here first:
        </Type>
        <div
          css={mq({
            display: 'grid',
            gridTemplateColumns: ['1fr', '1fr 1fr'],
            gap: ['1.5rem'],
            alignItems: 'stretch',
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
          <a
            href="https://youtu.be/fPWRlmedCbo"
            css={{
              backgroundImage: `linear-gradient(116.01deg, var(--grad1-2), var(--grad1-1))`,
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Video />
            <Type
              as="h2"
              look="heading20bold"
              css={{
                margin: '.5rem 0 .5rem 0 !important',
                color: 'inherit',
              }}
            >
              Video Intro →
            </Type>
            <Type
              as="p"
              look="body18"
              css={{
                color: 'inherit',
              }}
            >
              Learn how Keystone’s leading a new generation of content management tools.
            </Type>
          </a>
          <Link
            href="/why-keystone"
            css={{
              backgroundImage: `linear-gradient(116.01deg, var(--grad2-2), var(--grad2-1))`,
            }}
          >
            <Bulb />
            <Type
              as="h2"
              look="heading20bold"
              css={{
                margin: '.5rem 0 .5rem 0 !important',
                color: 'inherit',
              }}
            >
              Why Keystone →
            </Type>
            <Type
              as="p"
              look="body18"
              css={{
                color: 'inherit',
              }}
            >
              The makers. The vision. What’s in the box, and what you can build with it.
            </Type>
          </Link>
        </div>
      </div>
      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr 1fr', null, '1fr 1fr 1fr'],
          gap: ['1.5rem'],
          alignItems: 'stretch',
          margin: '1.5rem 0 2.5rem',
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
        <Link
          href="/for-developers"
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
            For Developers →
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
        </Link>
        <Link
          href="/for-content-management"
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
            For Editors →
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
        </Link>
        <Link
          href="/for-organisations"
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
        </Link>
      </div>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        Walkthroughs
      </Type>

      <Type as="p" look="body18" margin="0 0 1.5rem 0">
        Step-by-step instructions for getting things done with Keystone.
      </Type>

      <Walkthroughs />

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        Guides
      </Type>

      <Type as="p" look="body18" margin="0 0 1.5rem 0">
        Practical explanations of Keystone’s fundamental building blocks. When you’re trying to get
        something done, Keystone guides show you how to think about, and get the most out of each
        feature.
      </Type>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr', '1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well grad="grad2" heading="Command line foundations" href="/docs/guides/cli">
          Keystone’s CLI helps you develop, build, and deploy projects. This guide explains all you
          need to standup a new backend in the terminal.
        </Well>
        <Well grad="grad2" heading="Understanding Relationships" href="/docs/guides/relationships">
          Learn how to reason about and configure relationships in Keystone, so you can bring value
          to your project through structured content.
        </Well>
        <Well grad="grad2" heading="GraphQL Queries - Filters" href="/docs/guides/filters">
          Query filters are an integral part of Keystone’s powerful GraphQL APIs. This guide will
          show you how to use filters to get the data you need from your system.
        </Well>
        <Well grad="grad2" heading="Understanding Hooks" href="/docs/guides/hooks">
          Learn how to use Hooks within your schema to extend Keystone’s powerful CRUD GraphQL APIs
          with your own business logic.
        </Well>
        <Well grad="grad2" heading="How To Use Document Fields" href="/docs/guides/document-fields">
          Keystone’s document field is a highly customisable rich text editor that stores content as
          structured JSON. Learn how to configure it and incorporate your own custom React
          components.
        </Well>
        <Well grad="grad2" heading="Document Field Demo" href="/docs/guides/document-field-demo">
          Test drive the many features of Keystone’s Document field on this website.
        </Well>
        <Well grad="grad2" heading="Custom Fields" href="/docs/guides/custom-fields">
          Learn how to define your own custom field types in Keystone, with customisable backend
          data structure, and Admin UI appearance.
        </Well>
        <Well grad="grad2" heading="Testing Guide" href="/docs/guides/testing">
          Learn how to test the behaviour of your Keystone system to ensure it does what you expect.
        </Well>
        <Well grad="grad2" heading="Virtual fields" href="/docs/guides/virtual-fields">
          Virtual fields offer a powerful way to extend your GraphQL API. This guide introduces the
          syntax and shows you how start simply and end up with a complex result.
        </Well>
        <Well grad="grad2" heading="Choosing a Database" href="/docs/guides/choosing-a-database">
          Keystone supports Postgres, MySQL and SQLite. This guide explains how to choose the best
          for your project.
        </Well>
        <Well grad="grad2" heading="Images and Files" href="/docs/guides/images-and-files">
          Learn how to store and manage Images and Files in Keystone.
        </Well>
      </div>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        Example projects
      </Type>

      <Type as="p" look="body18" margin="0 0 1.5rem 0">
        A growing collection of projects you can run locally to learn more about Keystone features.
        Use these as a reference for best practice, and a jumping off point when adding features to
        your own Keystone project.{' '}
        <a
          href="https://github.com/keystonejs/keystone/tree/main/examples"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Github &rarr;
        </a>
      </Type>

      <Examples />

      <CommunityCta />
    </DocsPage>
  );
}
