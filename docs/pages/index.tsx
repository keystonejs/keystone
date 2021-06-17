/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { Page } from '../components/Page';

export default function IndexPage() {
  return (
    <Page>
      <h1>Welcome</h1>
      <ul>
        <li>
          <Link href="/docs">
            <a>Docs pages</a>
          </Link>
        </li>
        <li>
          <Link href="/why-keystone">
            <a>Why Keystone</a>
          </Link>
        </li>
        <li>
          <Link href="/whats-new">
            <a>What's New</a>
          </Link>
        </li>
        <li>
          <Link href="/for-developers">
            <a>For Developers</a>
          </Link>
        </li>
        <li>
          <Link href="/for-designers">
            <a>For Designers</a>
          </Link>
        </li>
        <li>
          <Link href="/for-content-management">
            <a>For Content Management</a>
          </Link>
        </li>
      </ul>
    </Page>
  );
}
