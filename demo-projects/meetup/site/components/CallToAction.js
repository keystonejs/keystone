/** @jsx jsx */
import { jsx } from '@emotion/core';
import { shadows, gridSize } from '../theme';

import { Button } from '../primitives';
import { H2 } from '../primitives/Typography';

export default function CallToAction() {
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
      <p css={{ maxWidth: 550, margin: '0 auto', margin: `${gridSize * 3}px auto` }}>
        Every <strong>3rd Wednesday of the month</strong> you'll find us talking about what we're
        doing and what's happening around us in the world of JavaScript.
      </p>
      <Button>Join us now</Button>
    </div>
  );
}
