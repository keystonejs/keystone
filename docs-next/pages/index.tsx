import React from 'react';
import Link from 'next/link';

import { Page } from '../components/Page';
import { SubscribeForm } from '../components/SubscribeForm';

export default function IndexPage() {
  return (
    <Page isProse>
      <h1>Welcome</h1>
      <p>
        Keystone Next is a preview of the next major release of KeystoneJS, the most powerful
        headless content management system around.
      </p>
      <p>
        🗺 If you're wondering what we're up to, check out our <Link href="/roadmap">Roadmap</Link>.
      </p>
      <p>
        In this major update, we've focused on improving Keystone's <strong>interfaces</strong>,
        including the way you configure and run Keystone projects, and a whole new Admin UI. To
        learn more, check out our <Link href="/whats-new">What's New</Link> page.
      </p>
      <p>
        🤩 If you want to see one of our favourite new features, check out our{' '}
        <Link href="/guides/document-fields">Document Field</Link>
      </p>
      <p>
        <SubscribeForm>
          <div className="mb-2">
            <span className="inline-block bg-green-100 border border-green-300 uppercase text-green-600 px-2 text-sm font-semibold rounded">
              New
            </span>{' '}
            Subscribe to our mailing list to stay in the loop!
          </div>
        </SubscribeForm>
      </p>
      <p>
        Hit us up at{' '}
        <a href="https://twitter.com/keystonejs" target="_blank">
          @KeystoneJS
        </a>{' '}
        with your feedback.
      </p>
    </Page>
  );
}
