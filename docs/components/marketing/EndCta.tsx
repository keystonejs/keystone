/** @jsx jsx */
import { jsx } from '@emotion/react';
import { HTMLAttributes } from 'react';

import { Highlight } from '../primitives/Highlight';
import { Button } from '../primitives/Button';
import { Type } from '../primitives/Type';
import { ArrowR } from '../icons/ArrowR';
import { Tick } from '../icons/Tick';
import { CodeBox } from './CodeBox';
import { Section } from './Section';

type EndCtaProps = {
  grad?: 'grad1' | 'grad2' | 'grad3' | 'grad4' | 'grad5';
} & HTMLAttributes<HTMLElement>;

export function EndCta({ grad = 'grad1', ...props }: EndCtaProps) {
  return (
    <Section
      css={{
        textAlign: 'center',
      }}
      {...props}
    >
      <Type as="h2" look="heading64" margin="0 auto">
        Start building <Highlight look={grad}>today.</Highlight>
      </Type>
      <ul
        css={{
          listStyle: 'none',
          margin: '1rem 0 0 0',
          padding: 0,
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          '& > li': {
            display: 'inline-block',
            padding: 0,
          },
          '& svg': {
            height: '1rem',
            marginRight: '1rem',
          },
        }}
      >
        <li>
          <Tick grad={grad} />
          <Type look="body18" color="var(--muted)">
            5 minute starters
          </Type>
        </li>
        <li>
          <Tick grad={grad} />
          <Type look="body18" color="var(--muted)">
            Example projects
          </Type>
        </li>
        <li>
          <Tick grad={grad} />
          <Type look="body18" color="var(--muted)">
            Free forever
          </Type>
        </li>
        <li>
          <Tick grad={grad} />
          <Type look="body18" color="var(--muted)">
            No lock-in
          </Type>
        </li>
      </ul>
      <CodeBox code="yarn create keystone-app" css={{ margin: '2rem 0' }} />
      <div>
        <Button as="a" href="/docs">
          Get started <ArrowR />
        </Button>
      </div>
    </Section>
  );
}
