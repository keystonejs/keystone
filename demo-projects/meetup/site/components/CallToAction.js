/** @jsx jsx */
import { jsx } from '@emotion/core';
import { shadows } from '../theme';

import { Button } from '../primitives';

export default function CallToAction() {
  return (
    <div
      css={{
        boxShadow: shadows.lg,
        maxWidth: 600,
        margin: '0 auto',
        background: 'white',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h2 css={{ padding: '0 3rem' }}>
        In Sydney and into JavaScript? You <span css={{ textDecoration: 'underline' }}>need</span>{' '}
        to join the meetup!
      </h2>
      <p>
        Every <strong>3rd Wednesday of the month</strong> you'll find us talking about what we're
        doing and what's happening around us in the world of JavaScript.
      </p>
      <Button>Join us now</Button>
    </div>
  );
}
