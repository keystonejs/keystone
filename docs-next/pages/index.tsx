/** @jsx jsx  */
import { Button } from '@keystone-ui/button';
import { jsx } from '@keystone-ui/core';
import Link from 'next/link';

import { SubscribeForm } from '../components/SubscribeForm';
import { Page } from '../components/Page';

export default function IndexPage() {
  return (
    <Page isProse>
      <h1>Welcome</h1>
      <p>
        Keystone Next is a preview of the next major release of KeystoneJS, the most powerful
        headless content management system around.
      </p>
      <p>
        <Link href="/tutorials/getting-started-with-create-keystone-app" passHref>
          <Button tone="active" weight="bold">
            Get started
          </Button>
        </Link>
      </p>
      <p>
        We’re improving Keystone's <strong>interfaces</strong>, including the way you configure and
        run projects, and creating a whole new Admin UI. To learn more, check out our{' '}
        <Link href="/roadmap">Roadmap</Link>, and <Link href="/whats-new">What’s New</Link>.
      </p>
      <p>
        🤩 &nbsp;To see one of our favourite new features, check out the{' '}
        <Link href="/guides/document-fields">Document Field</Link>.
      </p>
      <h2>Stay connected</h2>
      <p>
        <SubscribeForm>
          <div
            css={{
              marginBottom: '0.5rem',
            }}
          >
            <span
              css={{
                display: 'inline-block',
                border: '1px solid var(--green-300)',
                borderRadius: '0.25rem',
                textTransform: 'uppercase',
                background: 'var(--green-100)',
                color: 'var(--green-600)',
                padding: '0 0.5rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                lineHeight: '1.25rem',
              }}
            >
              New
            </span>{' '}
            Subscribe to our mailing list to stay in the loop!
          </div>
        </SubscribeForm>
      </p>
      <p>
        Get help in our{' '}
        <a href="https://community.keystonejs.com/" target="_blank">
          Community Slack
        </a>
        , and follow us on{' '}
        <a href="https://twitter.com/keystonejs" target="_blank">
          Twitter
        </a>{' '}
        for the latest news and announcements.
      </p>
    </Page>
  );
}
