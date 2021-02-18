import React from 'react';
import Link from 'next/link';

import { Page } from '../components/Page';
import { SignupForm } from '../components/SignupForm';

export default function IndexPage() {
  return (
    <Page isProse>
      <h1>Welcome</h1>
      <p>These are the docs for the next version of KeystoneJS.</p>
      <p>We still need to write most of them – thanks for your patience as we work on it.</p>
      <p>
        Keystone Next is a preview of the next major release of KeystoneJS, the most powerful
        headless content management system around.
      </p>
      <p>
        If you're wondering what we're up to, check out our <Link href="/roadmap">Roadmap</Link>.
      </p>
      <p>
        In this major update, we've focused on improving Keystone's <strong>interfaces</strong>,
        including the way you configure and run Keystone projects, and a whole new Admin UI. To
        learn more, check out our <Link href="/whats-new">What's New</Link> page.
      </p>
      <SignupForm />
      <p>
        Please reach out to us on Twitter at{' '}
        <a href="https://twitter.com/keystonejs" target="_blank">
          @KeystoneJS
        </a>{' '}
        with your feedback.
      </p>
    </Page>
  );
}
