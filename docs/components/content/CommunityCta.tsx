/** @jsxRuntime classic */
/** @jsx jsx */
import type { HTMLAttributes } from 'react';
import { jsx } from '@emotion/react';
import Image from 'next/image';

import communityMap from '../../public/assets/community-map.png';

import { useMediaQuery } from '../../lib/media';
import { Button } from '../primitives/Button';
import { Type } from '../primitives/Type';
import { ArrowR } from '../icons/ArrowR';
import { Tick } from '../icons/Tick';
import { Section } from './Section';

export function CommunityCta(props: HTMLAttributes<HTMLElement>) {
  const mq = useMediaQuery();

  return (
    <Section
      css={mq({
        display: 'grid',
        gridTemplateColumns: ['1fr', null, '1fr 1fr', '1.1fr 0.9fr'],
        gap: '3rem',
        alignItems: 'center',
        border: '1px solid var(--border-muted)',
        borderRadius: '1rem',
        padding: ['1rem', '1rem', '2rem'],
        boxShadow: '0 1.4375rem 2.8125rem var(--shadow)',
      })}
      {...props}
    >
      <div
        css={{
          display: 'grid',
          '& > div': {
            display: 'inline-grid !important',
            justifyContent: 'center',
            alignSelf: 'center',
          },
        }}
      >
        <Image
          src={communityMap}
          alt="A map of our awesome contributors"
          width={1518}
          height={928}
        />
      </div>
      <div
        css={{
          paddingRight: '.3rem',
        }}
      >
        <Type as="h2" look="heading30">
          Learn with others in a supportive community
        </Type>
        <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
          Share your work and get the help you need in the Keystone community Slack: an inclusive
          space to share ideas and explore what‘s possible.
        </Type>
        <Button
          as="a"
          href="https://community.keystonejs.com"
          target="_blank"
          rel="noopener noreferrer"
          css={{
            marginTop: '1rem',
          }}
        >
          Join the community Slack <ArrowR />
        </Button>
        <ul
          css={{
            listStyle: 'none',
            margin: '2rem 0 0 0',
            padding: 0,
            display: 'inline-block',
            '& li': {
              display: 'inline-flex',
              alignItems: 'center',
              marginRight: '1rem',
            },
            '& svg': {
              height: '1.25rem',
              margin: '0.25rem 0.5rem 0 0',
            },
          }}
        >
          <li>
            <Tick grad="grad4" />
            <Type look="body18" color="var(--muted)">
              2500+ members
            </Type>
          </li>
          <li>
            <Tick grad="grad4" />
            <Type look="body18" color="var(--muted)">
              Personalised support
            </Type>
          </li>
        </ul>
      </div>
    </Section>
  );
}
