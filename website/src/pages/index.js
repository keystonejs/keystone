/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { globalStyles, colors } from '@arch-ui/theme';
import { SkipNavContent } from '@reach/skip-nav';

import Layout from '../templates/layout';
import { HomepageContent } from '../components/homepage/HomepageContent';
import { VideoIntro } from '../components/homepage/VideoIntro';
import { CONTAINER_GUTTERS, CONTAINER_WIDTH } from '../components/Container';
import { HEADER_HEIGHT } from '../components/Header';
import { Button, Container, Sidebar } from '../components';
import { mq } from '../utils/media';

export default () => (
  <Layout>
    {({ sidebarIsVisible, sidebarOffset }) => (
      <>
        <Global styles={globalStyles} />
        <Container>
          <Sidebar isVisible={sidebarIsVisible} offsetTop={sidebarOffset} mobileOnly />
        </Container>
        <Hero />
        <Points />
        <Whys />
        <Technology />
        <div css={{ paddingTop: 80, paddingBottom: 80 }}>
          <Container>
            <p css={{ color: colors.N40, fontSize: '0.9em' }}>
              Keystone 5 is built by{' '}
              <a css={{ color: colors.N80 }} href="https://www.thinkmill.com.au">
                Thinkmill
              </a>{' '}
              and{' '}
              <a
                css={{ color: colors.N80 }}
                href="https://github.com/keystonejs/keystone-5/blob/master/CONTRIBUTING.md#contributors"
              >
                Contributors
              </a>{' '}
              around the world.
            </p>

            <p css={{ color: colors.N40, fontSize: '0.9em' }}>
              Keystone v4 has moved to{' '}
              <a css={{ color: colors.N80 }} href="http://v4.keystonejs.com">
                v4.keystonejs.com
              </a>
              .{' '}
            </p>
          </Container>
        </div>
      </>
    )}
  </Layout>
);

const Hero = () => (
  <div css={{ overflow: 'hidden' }}>
    <SkipNavContent />
    <Container
      css={mq({
        display: 'flex',
        paddingTop: 80,
        paddingBottom: 80,
        fontSize: [14, 18],
        lineHeight: 1.6,
      })}
    >
      <HomepageContent />
      <VideoIntro />
    </Container>
  </div>
);

const Points = () => {
  return (
    <div
      css={{
        backgroundColor: colors.N100,
        color: colors.N10,
        paddingTop: 80,
        paddingBottom: 80,
        textAlign: 'center',
      }}
    >
      <Container>
        <div css={{ maxWidth: 800, margin: '0 auto', marginBottom: '2em' }}>
          <h2
            css={{
              marginTop: 0,
              fontSize: '2.4em',
              fontWeight: 'normal',
              lineHeight: 1,
              marginBottom: '1em',
              fontFamily: 'Consolas,Menlo,Monaco,"Andale Mono","Ubuntu Mono",monospace',
            }}
          >
            {`schema => ({ GraphQL, AdminUI })`}
          </h2>
          <p css={{ fontSize: '1.25em', lineHeight: '1.5' }}>
            A KeystoneJS instance can be summarised as a function of your schema which creates a
            GraphQL API for querying, and an AdminUI for managing your data:
          </p>
        </div>
        <div css={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridGap: 24 }}>
          <div
            css={{
              boxShadow: `0 5px 20px rgba(0,0,0,.08)`,
              backgroundColor: colors.N90,
              borderRadius: 4,
              padding: 24,
            }}
          >
            <pre>{`
            
            keystone.createList('Todo', {
  fields: {
    task: { type: Text },
  },
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
  },
});
            
            keystone.createList('Todo', {
  fields: {
    task: { type: Text },
  },
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
  },
});


`}</pre>
          </div>
          <div
            css={{
              boxShadow: `0 5px 20px rgba(0,0,0,.08)`,
              backgroundColor: colors.N90,
              borderRadius: 4,
              padding: 24,
            }}
          >
            <pre>{`
            
            keystone.createList('Todo', {
  fields: {
    task: { type: Text },
  },
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
  },
});
            
            keystone.createList('Todo', {
  fields: {
    task: { type: Text },
  },
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
  },
});


`}</pre>
          </div>
        </div>
      </Container>
    </div>
  );
};

const Whys = () => (
  <div
    css={{
      paddingTop: 80,
      paddingBottom: 80,
    }}
  >
    <Container>
      <div css={{ maxWidth: 800, margin: '0 auto', marginBottom: '2em', textAlign: 'center' }}>
        <h2
          css={{
            marginTop: 0,
            fontSize: '2.4em',
            fontWeight: 800,
            lineHeight: 1,
            marginBottom: '1em',
          }}
        >
          Why KeystoneJS
        </h2>
        <p css={{ fontSize: '1.25em', lineHeight: '1.5' }}>
          Every framework has its own properties and advantages, fast rendering, SEO, ease of
          deployment or progressive enhancement. Prismic integrates with every framework so that you
          can choose the best fit for your project
        </p>
      </div>
      <div css={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridGap: 24 }}>
        <div css={{ boxShadow: `0 5px 20px rgba(0,0,0,.08)`, borderRadius: 4, padding: 24 }}>
          <h3
            css={{
              color: colors.primary,
              fontSize: '1.4em',
              lineHeight: '1',
              margin: `0 0 16px 0`,
            }}
          >
            Own your data
          </h3>
          <p css={{ fontSize: '1em', lineHeight: '1.5' }}>
            Next is a great option if you are familiar with React but want static-site generation,
            server-side rendering, Serverless deployment, and a growing ecosystem.
          </p>
        </div>
        <div css={{ boxShadow: `0 5px 20px rgba(0,0,0,.08)`, borderRadius: 4, padding: 24 }}>
          <h3
            css={{
              color: colors.primary,
              fontSize: '1.4em',
              lineHeight: '1',
              margin: `0 0 16px 0`,
            }}
          >
            BYO Database
          </h3>
          <p css={{ fontSize: '1em', lineHeight: '1.4', margin: 0 }}>
            Gatsby is an extremely popular static site generator based on React. It offers a great
            developer experience thanks to a huge selection of plugins.{' '}
          </p>
        </div>
        <div css={{ boxShadow: `0 5px 20px rgba(0,0,0,.08)`, borderRadius: 4, padding: 24 }}>
          <h3
            css={{
              color: colors.primary,
              fontSize: '1.4em',
              lineHeight: '1',
              margin: `0 0 16px 0`,
            }}
          >
            Works with any front-end
          </h3>
          <p css={{ fontSize: '1em', lineHeight: '1.4', margin: 0 }}>
            Great for SEO, Nuxt is a good choice if you're familiar with Vue and you are looking for
            static-site generation and server-side rendering.{' '}
          </p>
        </div>
        <div css={{ boxShadow: `0 5px 20px rgba(0,0,0,.08)`, borderRadius: 4, padding: 24 }}>
          <h3
            css={{
              color: colors.primary,
              fontSize: '1.4em',
              lineHeight: '1',
              margin: `0 0 16px 0`,
            }}
          >
            Static{' '}
          </h3>
          <p css={{ fontSize: '1em', lineHeight: '1.4', margin: 0 }}>
            Great for SEO, Nuxt is a good choice if you're familiar with Vue and you are looking for
            static-site generation and server-side rendering.{' '}
          </p>
        </div>
        <div css={{ boxShadow: `0 5px 20px rgba(0,0,0,.08)`, borderRadius: 4, padding: 24 }}>
          <h3
            css={{
              color: colors.primary,
              fontSize: '1.4em',
              lineHeight: '1',
              margin: `0 0 16px 0`,
            }}
          >
            Extensible
          </h3>
          <p css={{ fontSize: '1em', lineHeight: '1.4', margin: 0 }}>
            Great for SEO, Nuxt is a good choice if you're familiar with Vue and you are looking for
            static-site generation and server-side rendering.{' '}
          </p>
        </div>
        <div css={{ boxShadow: `0 5px 20px rgba(0,0,0,.08)`, borderRadius: 4, padding: 24 }}>
          <h3
            css={{
              color: colors.primary,
              fontSize: '1.4em',
              lineHeight: '1',
              margin: `0 0 16px 0`,
            }}
          >
            Admin UI included
          </h3>
          <p css={{ fontSize: '1em', lineHeight: '1.4', margin: 0 }}>
            Great for SEO, Nuxt is a good choice if you're familiar with Vue and you are looking for
            static-site generation and server-side rendering.{' '}
          </p>
        </div>
      </div>
    </Container>
  </div>
);

const Technology = () => (
  <div
    css={{
      backgroundColor: colors.N100,
      color: colors.N10,
      paddingTop: 80,
      paddingBottom: 80,
      textAlign: 'center',
    }}
  >
    <Container>
      <div css={{ maxWidth: 800, margin: '0 auto', marginBottom: '2em' }}>
        <h2
          css={{
            marginTop: 0,
            fontSize: '2.4em',
            fontWeight: 600,
            lineHeight: 1,
            marginBottom: '1em',
          }}
        >
          Pair with the technology of your choice
        </h2>
        <p css={{ fontSize: '1.125rem', lineHeight: '1.5' }}>
          Every framework has its own properties and advantages, fast rendering, SEO, ease of
          deployment or progressive enhancement. Prismic integrates with every framework so that you
          can choose the best fit for your project
        </p>
      </div>
      <div css={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridGap: 24 }}>
        <div
          css={{
            boxShadow: `0 5px 20px rgba(0,0,0,.08)`,
            backgroundColor: colors.N90,
            borderRadius: 4,
            padding: 24,
          }}
        >
          <h3 css={{ fontSize: '1.5em', lineHeight: '1' }}>NextJS</h3>
          <p css={{ fontSize: '1.25em', lineHeight: '1.5' }}>
            Next is a great option if you are familiar with React but want static-site generation,
            server-side rendering, Serverless deployment, and a growing ecosystem.
          </p>
          <Button appearance="primary" variant="solid">
            Read more
          </Button>
        </div>
        <div
          css={{
            boxShadow: `0 5px 20px rgba(0,0,0,.08)`,
            backgroundColor: colors.N90,
            borderRadius: 4,
            padding: 24,
          }}
        >
          <h3 css={{ fontSize: '1.5em', lineHeight: '1' }}>NuxtJS</h3>
          <p css={{ fontSize: '1.25em', lineHeight: '1.5' }}>
            Gatsby is an extremely popular static site generator based on React. It offers a great
            developer experience thanks to a huge selection of plugins.{' '}
          </p>
          <Button appearance="primary" variant="solid">
            Read more
          </Button>
        </div>
        <div
          css={{
            boxShadow: `0 5px 20px rgba(0,0,0,.08)`,
            backgroundColor: colors.N90,
            borderRadius: 4,
            padding: 24,
          }}
        >
          <h3 css={{ fontSize: '1.5em', lineHeight: '1' }}>Static </h3>
          <p css={{ fontSize: '1.25em', lineHeight: '1.5' }}>
            Great for SEO, Nuxt is a good choice if you're familiar with Vue and you are looking for
            static-site generation and server-side rendering.{' '}
          </p>
          <Button appearance="primary" variant="solid">
            Read more
          </Button>
        </div>
      </div>
    </Container>
  </div>
);
