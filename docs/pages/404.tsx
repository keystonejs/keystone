/** @jsxRuntime classic */
/** @jsx jsx  */
import { jsx } from '@emotion/react';
import { useRouter } from 'next/router';

import { Highlight } from '../components/primitives/Highlight';
import { Type } from '../components/primitives/Type';
import { Page } from '../components/Page';

function ConstructionIllustration() {
  return (
    <div
      css={{
        background: '#fff',
        width: '100%',
        maxWidth: '30rem',
        margin: '2rem auto 0',
        padding: '2rem',
        borderRadius: '2rem',
      }}
    >
      <img
        src="/assets/404.svg"
        alt="The Keystone logo under construction"
        css={{
          width: '100%',
        }}
      />
    </div>
  );
}

// Modifying this code may have security implications
// See.. https://github.com/keystonejs/keystone/pull/6411#issuecomment-906085389
const v5PathList = ['/tutorials', '/guides', '/keystonejs', '/api', '/discussions'];

export default function NotFoundPage() {
  const { asPath } = useRouter();
  const tryV5Link = asPath.startsWith('/') && v5PathList.some(i => asPath.startsWith(i));
  return (
    <Page title={'Page Not Found (404)'} description={'Page Not Found (404)'}>
      <div
        css={{
          display: 'grid',
          justifyItems: 'center',
          margin: '2rem 0',
          textAlign: 'center',
        }}
      >
        <Type as="h1" look="heading48" fontSize={['8vw', null, null, '5rem']}>
          <Highlight look="grad4">404</Highlight> <Type color="var(--muted)">Page Not Found</Type>
        </Type>
        <Type as="p" look="body18bold" margin="2rem 0 0">
          We're sorry but we couldn't find what you're looking for.
        </Type>
        {tryV5Link ? (
          <Type as="p" look="body18bold" margin="2rem 0 0">
            If you were looking for a page in the Keystone 5 docs, try{' '}
            <a href={'https://v5.keystonejs.com' + asPath}>https://v5.keystonejs.com{asPath}</a>.
          </Type>
        ) : null}
        <ConstructionIllustration />
      </div>
    </Page>
  );
}
