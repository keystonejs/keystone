/** @jsx jsx */
import { useRef } from 'react';
import { jsx } from '@keystone-ui/core';
import slugify from '@sindresorhus/slugify';
import { CopyToClipboard } from './CopyToClipboard';

const getAnchor = (text: string) => {
  if (typeof text === 'string') {
    return slugify(text);
  }
  return '';
};

// emotions JSX pragma  appends the correct css prop type
// if the underlying component expects an optional className prop
interface StringOnlyChildren {
  children: string;
  className?: string;
}

interface HeadingProps extends StringOnlyChildren {
  as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}
const Heading = ({ as: Tag, children, ...props }: HeadingProps) => {
  const headingRef = useRef(null);
  const depth = parseInt(Tag.slice(1), 10);
  const hasCopy = depth > 1 && depth < 5;
  const id = getAnchor(children);
  return (
    <Tag
      css={{
        color: '#091E42', //N100 in arch
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
};

export const H1 = (props: StringOnlyChildren) => (
  <Heading
    css={{
      fontSize: '2.4rem',
      fontWeight: 500,
      letterSpacing: '-0.025em',
      marginTop: 0,
    }}
    as="h1"
    {...props}
  />
);
export const H2 = (props: StringOnlyChildren) => (
  <Heading
    css={{
      fontSize: '1.8rem',
      fontWeight: 500,
      letterSpacing: '-0.025em',
      marginTop: 0,
    }}
    as="h2"
    {...props}
  />
);
export const H3 = (props: StringOnlyChildren) => (
  <Heading
    css={{
      fontSize: '1.4rem',
      fontWeight: 500,
      letterSpacing: '-0.025em',
      marginTop: 0,
    }}
    as="h3"
    {...props}
  />
);

export const H4 = (props: StringOnlyChildren) => <Heading {...props} as="h4" />;

export const H5 = (props: StringOnlyChildren) => (
  <Heading css={{ fontSize: '1rem' }} as="h5" {...props} />
);
export const H6 = (props: StringOnlyChildren) => (
  <Heading css={{ fontSize: '0.9rem' }} as="h6" {...props} />
);

export default Heading;
