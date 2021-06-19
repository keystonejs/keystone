/** @jsx jsx */
import slugify from '@sindresorhus/slugify';
import { jsx } from '@emotion/react';
import { useRef } from 'react';

import { CopyToClipboard } from './CopyToClipboard';

function getAnchor(text: string) {
  if (typeof text === 'string') {
    return slugify(text);
  }
  return '';
}

// emotions JSX pragma appends the correct css prop type
// if the underlying component expects an optional className prop
interface StringOnlyChildren {
  children: string;
  className?: string;
}

interface HeadingProps extends StringOnlyChildren {
  as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function Heading({ as: Tag, children, ...props }: HeadingProps) {
  const headingRef = useRef(null);
  const depth = parseInt(Tag.slice(1), 10);
  const hasCopy = depth > 1 && depth < 5;
  const id = getAnchor(children);

  return (
    <Tag
      css={{
        color: 'var(--text-heading)',
        fontWeight: 600,
        lineHeight: 1,
        marginBottom: '0.66em',
        marginTop: '1.66em',
      }}
      id={id}
      {...props}
    >
      <span
        ref={headingRef}
        css={{
          display: 'block',
          position: 'relative',
          '&:hover a, &:focus-within a': {
            opacity: 1,
          },
        }}
      >
        {hasCopy && <CopyToClipboard value={id} />}
        {children}
      </span>
    </Tag>
  );
}

export function H1(props: StringOnlyChildren) {
  return (
    <Heading
      css={{
        fontSize: 'var(--font-xxlarge)',
        fontWeight: 500,
        letterSpacing: '-0.025em',
        marginTop: 0,
      }}
      as="h1"
      {...props}
    />
  );
}

export function H2(props: StringOnlyChildren) {
  return (
    <Heading
      css={{
        fontSize: 'var(--font-xlarge)',
        fontWeight: 500,
        letterSpacing: '-0.025em',
        marginTop: 0,
      }}
      as="h2"
      {...props}
    />
  );
}

export function H3(props: StringOnlyChildren) {
  return (
    <Heading
      css={{
        fontSize: 'var(--font-large)',
        fontWeight: 500,
        letterSpacing: '-0.025em',
        marginTop: 0,
      }}
      as="h3"
      {...props}
    />
  );
}

export function H4(props: StringOnlyChildren) {
  return <Heading {...props} as="h4" />;
}

export function H5(props: StringOnlyChildren) {
  return <Heading css={{ fontSize: 'var(--font-small)' }} as="h5" {...props} />;
}

export function H6(props: StringOnlyChildren) {
  return <Heading css={{ fontSize: 'var(--font-xsmall)' }} as="h6" {...props} />;
}
