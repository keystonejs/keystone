/** @jsx jsx */
import type { HTMLAttributes } from 'react';
import { jsx } from '@emotion/react';
// import Image from 'next/image';

import { useMediaQuery } from '../../lib/media';
// import { Button } from '../primitives/Button';
import { Type } from '../primitives/Type';
// import { ArrowR } from '../icons/ArrowR';
// import { Tick } from '../icons/Tick';
import { Section } from './Section';
import { FeatureWell } from '../../components/primitives/FeatureWell';

export function LandingsCta(props: HTMLAttributes<HTMLElement>) {
  const mq = useMediaQuery();

  return (
    <Section
      css={mq({
        border: '1px solid var(--border-muted)',
        borderRadius: '1rem',
        padding: ['1.5rem', '2.5rem', null, '3.5rem'],
        boxShadow: '0 1.4375rem 2.8125rem var(--shadow)',
      })}
      {...props}
    >
      <Type as="h2" look="heading30">
        Unify your team dynamic
      </Type>
      <Type as="p" look="body18" color="var(--muted)" css={{ maxWidth: '34rem', margin: '1rem 0' }}>
        Enable a content culture that’s productive, collaborative, and fun. Open, flexible, and
        natural. A tool your team can grow with.
      </Type>
      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr 1fr', null, '1fr 1fr 1fr'],
          gap: ['1rem', '2rem', '2.5rem', null],
          alignItems: 'stretch',
          marginTop: '2.5rem',
        })}
      >
        <FeatureWell grad="grad3" heading="Developer Experience" href="/for-developers">
          Built the way you’d want it made, Keystone is at home with the tools you know and love.
        </FeatureWell>
        <FeatureWell grad="grad5" heading="Editor Experience" href="/for-content-management">
          The configurable editing environment you need to do your best work.
        </FeatureWell>
        <FeatureWell grad="grad4" heading="For Organisations" href="/for-organisations">
          Own your data, start fast, send your message anywhere, and scale on your terms.
        </FeatureWell>
      </div>
    </Section>
  );
}
