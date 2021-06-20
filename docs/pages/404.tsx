/** @jsx jsx  */
import { jsx } from '@emotion/react';

import { Highlight } from '../components/primitives/Highlight';
import { Type } from '../components/primitives/Type';
import { Page } from '../components/Page';

export default function WhatsNew() {
  return (
    <Page>
      <div
        css={{
          display: 'grid',
          justifyItems: 'center',
          margin: '7rem 0',
          textAlign: 'center',
        }}
      >
        <Type as="h1" look="heading94" fontSize={['15vw', null, null, null, '15rem']}>
          <Highlight look="grad4">Error 404</Highlight>
        </Type>
        <Type as="p" look="body18">
          We're sorry but we were unable to find what you're looking for.
        </Type>
      </div>
    </Page>
  );
}
