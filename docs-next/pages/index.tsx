import React from 'react';

import { Page } from '../components/Page';

export default function IndexPage() {
  return (
    <Page isProse>
      <h1>Welcome</h1>
      <p>These are the docs for the next version of KeystoneJS.</p>
      <p>We still need to write most of them – thanks for your patience as we work on it.</p>
      <p>
        If you have feedback, please reach out to us on Twitter at{' '}
        <a href="https://twitter.com/keystonejs" target="_blank">
          @KeystoneJS
        </a>
      </p>
    </Page>
  );
}
