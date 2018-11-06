// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';

import { StopIcon } from '@voussoir/icons';
import { colors } from '@voussoir/ui/src/theme';
import { Container } from '@voussoir/ui/src/primitives/layout';

type Props = {
  children: React.Node,
  Icon: React.ElementType,
};

export default function PageError({ children, Icon, ...props }: Props) {
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
PageError.defaultProps = {
  Icon: StopIcon,
};
