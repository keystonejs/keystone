/** @jsx jsx  */
import { jsx } from '@emotion/react';

import { Highlight } from '../components/primitives/Highlight';
import { Type } from '../components/primitives/Type';
import { Page } from '../components/Page';

export default function WhatsNew() {
  return (
    <Page>
      <Type as="h1" look="heading94">
        <Highlight look="grad4">404</Highlight>
      </Type>
      TODO
    </Page>
  );
}
