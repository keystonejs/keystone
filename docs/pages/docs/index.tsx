/** @jsx jsx */
import { jsx } from '@emotion/react';

import { SubscribeForm } from '../../components/SubscribeForm';
import { DocsPage } from '../../components/Page';

export default function Docs() {
  return (
    <DocsPage>
      TODO: Docs landing page
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
    </DocsPage>
  );
}
