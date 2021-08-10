/** @jsx jsx */
import type { HTMLAttributes } from 'react';
import { jsx } from '@emotion/react';
import Image from 'next/image';

import wesBosCta from '../../public/assets/wesbos-cta.jpg';

import { useMediaQuery } from '../../lib/media';
import { Button } from '../primitives/Button';
import { Type } from '../primitives/Type';
import { ArrowR } from '../icons/ArrowR';
import { Tick } from '../icons/Tick';
import { Section } from './Section';

export function AdvancedReactCta(props: HTMLAttributes<HTMLElement>) {
  const mq = useMediaQuery();

  return (
    <Section
      css={mq({
        display: 'grid',
        gridTemplateColumns: ['1fr', '1fr 1fr', '1fr 2fr', '1fr 3fr'],
        gap: ['1.5rem', '3rem'],
        alignItems: 'center',
        borderRadius: '1rem',
        padding: ['1rem', '1.5rem 3rem', null, '2rem 4rem', '2rem 6rem'],
        background: 'var(--code-bg)',
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
          src={wesBosCta}
          alt="Wes Bos Avatar"
          width={675}
          height={900}
          css={{
            objectFit: 'cover',
            borderRadius: '1rem',
          }}
        />
      </div>
      <div
        css={{
          paddingRight: '.3rem',
        }}
      >
        <Type as="h2" look="heading24">
          Learn Keystone for eCommerce with Wes Bos
        </Type>
        <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
          Master eCommerce with Keystone, React, & GraphQL. Join Wes as he teaches you how to build
          a full-stack online store with of today's best JavaScript technology.
        </Type>
        <ul
          css={{
            listStyle: 'none',
            margin: '0 0 1.5rem 0',
            padding: 0,
            display: 'inline-block',
            '& li': {
              display: 'inline-flex',
              alignItems: 'center',
              marginRight: '1rem',
              color: 'var(--muted)',
            },
            '& svg': {
              height: '1.25rem',
              margin: '0.25rem 0.5rem 0 0',
            },
          }}
        >
          <li>
            <Tick grad="grad2" />
            <Type look="body16" color="var(--muted)">
              11 modules
            </Type>
          </li>
          <li>
            <Tick grad="grad2" />
            <Type look="body16" color="var(--muted)">
              70 videos
            </Type>
          </li>
          <li>
            <Tick grad="grad2" />
            <Type look="body16" color="var(--muted)">
              28,000 students
            </Type>
          </li>
        </ul>
        <div>
          <Button
            as="a"
            look="soft"
            size="small"
            href="https://advancedreact.com/friend/KEYSTONE"
            target="_blank"
            rel="noopener noreferrer"
          >
            Course details <ArrowR />
          </Button>
        </div>
      </div>
    </Section>
  );
}
