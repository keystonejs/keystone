/** @jsx jsx */
import { jsx } from '@emotion/core';

import { StopIcon } from '@primer/octicons-react';
import { colors } from '@arch-ui/theme';
import { Container } from '@arch-ui/layout';

export default function PageError({ children, icon: Icon = StopIcon, ...props }) {
  return (
    <Container>
      <div
        css={{
          color: colors.N30,
          fontSize: 24,
          padding: '2em 1em',
          textAlign: 'center',
        }}
        {...props}
      >
        <Icon css={{ height: 48, width: 48 }} />
        {children}
      </div>
    </Container>
  );
}
