/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Wrapper } from '../primitives/Wrapper';
import { Emoji } from '../primitives/Emoji';

export function DocsFooter() {
  return (
    <footer
      css={{
        gridArea: 'footer',
        padding: '1rem 0',
        zIndex: 2,
        textAlign: 'center',
      }}
    >
      <Wrapper>
        Made in <Emoji symbol="🇦🇺" alt="Australia" /> by Thinkmill. Supported with{' '}
        <Emoji symbol="❤️" alt="Love" /> by the awesome Keystone community.
      </Wrapper>
    </footer>
  );
}
