import Link from 'next/link';
import { jsx } from '@emotion/core';

/** @jsx jsx */

export default () => (
  <header
    css={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '48px 0',
    }}
  >
    <p css={{ margin: 0, fontSize: '2em' }}>My Blog</p>
    <Link href="/post/new" passHref>
      <a css={{ color: 'hsl(200, 20%, 50%)', cursor: 'pointer' }}>+ Add Post</a>
    </Link>
  </header>
);
