/** @jsx jsx */
import { jsx } from '@emotion/core';
import contrast from 'get-contrast';
import getConfig from 'next/config';
import { shadows, gridSize } from '../theme';

import { Button } from '../primitives';
import { H2 } from '../primitives/Typography';
import { colors } from '../theme';

const { publicRuntimeConfig } = getConfig();

export default function CallToAction() {
  const { meetup } = publicRuntimeConfig;
  return (
    <div
      css={{
        position: 'relative',
        zIndex: 2,
        boxShadow: shadows.lg,
        maxWidth: gridSize * 100,
        margin: '0 auto',
        background: 'white',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <H2 size={3} css={{ padding: '0 3rem' }}>
        In Sydney and into JavaScript? <br />
        You need to join our meetup!
      </H2>
      <p css={{ maxWidth: 550, margin: `${gridSize * 3}px auto` }}>
        Every <strong>3rd Wednesday of the month</strong> you'll find us talking about what we're
        doing and what's happening around us in the world of JavaScript.
      </p>
      <Button
        background={meetup.themeColor}
        foreground={
          contrast.ratio(colors.greyDark, meetup.themeColor) >
          contrast.ratio(colors.greyLight, meetup.themeColor)
            ? colors.greyDark
            : 'white'
        }
      >
        Join us now
      </Button>
    </div>
  );
}
