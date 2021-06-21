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
          margin: '2rem 0',
          textAlign: 'center',
        }}
      >
        <div
          css={{
            background: '#fff',
            width: '90vw',
            maxWidth: '41.875rem',
            margin: '2rem auto',
            padding: '2rem',
            borderRadius: '2rem',
          }}
        >
          <img
            src="/assets/404.svg"
            alt="The Keystone logo under construction"
            css={{
              width: '100%',
              paddingLeft: '10vw',
            }}
          />
        </div>
        <Type as="p" look="body18bold" margin="0">
          We're sorry but we were unable to find what you're looking for.
        </Type>
        <Type
          as="h1"
          look="heading94"
          fontSize={['15vw', null, null, null, '15rem']}
          css={{ lineHeight: 1 }}
        >
          <Highlight look="grad4">Error 404</Highlight>
        </Type>
      </div>
    </Page>
  );
}
