/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { Page } from '../components/Page';

export default function IndexPage() {
  return (
    <Page>
      <h1>TODO:</h1>
      <ul>
        <li>
          <Link href="/why-keystone">
            <a>Why Keystone</a>
          </Link>
        </li>
        <li>
          <Link href="/for-developers">
            <a>For Developers</a>
          </Link>
        </li>
        <li>
          <Link href="/for-organisations">
            <a>For Organisations</a>
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
