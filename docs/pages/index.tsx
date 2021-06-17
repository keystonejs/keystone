/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { Page } from '../components/Page';

export default function IndexPage() {
  return (
    <Page>
      <h1>Welcome</h1>
      <Link href="/docs">
        <a>Docs pages</a>
      </Link>
    </Page>
  );
}
