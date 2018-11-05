/** @jsx jsx */
import { jsx } from '@emotion/core';

import { StopIcon } from '@voussoir/icons';
import { colors } from '@voussoir/ui/src/theme';
import { Container } from '@voussoir/ui/src/primitives/layout';

export default function PageError({ children, Icon, ...props }) {
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
