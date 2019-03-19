/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { colors, globalStyles } from '@arch-ui/theme';

import { Button, Header } from '../components';
import { CONTAINER_GUTTERS } from '../components/Container';
import { HEADER_HEIGHT } from '../components/Header';
import { media, mediaOnly, mediaMax, mq } from '../utils/media';
import illustrationPNG from '../images/illustration.png';

console.log('mediaOnly', mediaOnly.sm);

export default () => (
  <>
    <Global styles={globalStyles} />
    <Header key="global-header" style={{ position: 'relative', zIndex: 1 }} />
    <Hero />
  </>
);

const Container = props => (
  <div
    css={mq({
      marginLeft: 'auto',
      marginRight: 'auto',
      paddingLeft: CONTAINER_GUTTERS,
      paddingRight: CONTAINER_GUTTERS,
      width: [null, null, 992, 1140],
    })}
    {...props}
  />
);

const Hero = () => (
  <div
    css={mq({
      overflow: 'hidden',

      [media.sm]: {
        marginTop: -HEADER_HEIGHT / 2,
      },
    })}
  >
    <Container
      css={mq({
        display: 'flex',
        flexDirection: ['column', 'row'],
        fontSize: [14, 18],
        lineHeight: 1.6,
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        position: 'relative',

        [media.sm]: {
          background: `url(${illustrationPNG}) no-repeat center right`,
          backgroundSize: '761px 410px',
        },
      })}
    >
      <div
        css={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          flex: 1,

          [mediaMax.sm]: {
            textAlign: 'center',
          },
          [mediaOnly.md]: {
            paddingRight: '10em',
          },
        }}
      >
        <h1
          css={{
            color: colors.N100,
            fontSize: '2.4em',
            fontWeight: 800,
            lineHeight: 1,
            margin: 0,

            [mediaMax.sm]: {
              marginTop: '1em',
            },
          }}
        >
          Keystone 5
        </h1>

        <div css={{ color: colors.N80 }}>
          <p>A scalable platform and CMS to build Node.js applications.</p>
          <p>
            Includes first-class GraphQL support, a modular architecture and an improved Admin UI.
          </p>
        </div>
        <div
          css={{
            alignItems: 'center',
            display: 'flex',
            margin: '2em 0',

            [mediaMax.xs]: {
              alignItems: 'stretch',
              flexDirection: 'column',
              margin: '2em auto',
            },
          }}
        >
          <Button
            appearance="primary"
            variant="solid"
            to="/quick-start/"
            css={{
              [mediaMax.sm]: { flex: 1 },
              [media.sm]: {
                marginRight: 4,
              },
            }}
          >
            Get Started
          </Button>
          <Button
            variant="link"
            href="https://github.com/keystonejs/keystone-5"
            css={{
              [mediaMax.sm]: { flex: 1 },
              [media.sm]: {
                marginLeft: 4,
              },
            }}
            target="_blank"
          >
            View on GitHub
          </Button>
        </div>
        <img
          src={illustrationPNG}
          css={mq({
            display: 'block',
            height: 'auto',
            margin: [`2em -40px`, `2em auto`],
            maxWidth: ['calc(100% + 80px)', '80%'],

            [media.sm]: {
              display: 'none',
            },
          })}
        />
        <p css={{ color: colors.N40, fontSize: '0.85em' }}>
          Keystone 5 is currently in alpha release and under intensive development by Thinkmill and
          contributors around the world.
        </p>
      </div>
      <div
        css={{
          display: 'none',

          [media.sm]: {
            display: 'block',
            flex: 1,
          },
        }}
      />
    </Container>
  </div>
);
