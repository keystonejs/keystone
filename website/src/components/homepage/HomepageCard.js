/** @jsx jsx */
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';
import { Link } from 'gatsby';

import { media } from '../../utils/media';

const Grid = props => (
  <div
    css={{
      display: 'grid',
      gridGap: '1rem',

      [media.sm]: {
        gridGap: '1.5rem',
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
    }}
    {...props}
  />
);

const Card = ({ heading, content, to, variant, ...props }) => (
  <Link
    css={{
      display: 'flex',
      flexDirection: 'column',
      boxShadow: `0 5px 20px rgba(0, 0, 0, .08)`,
      borderRadius: 8,
      padding: '2rem 1.5rem 1.5rem 1.5rem',
      backgroundColor: variant === 'dark' ? colors.N100 : null,
      color: 'inherit',
      textDecoration: 'none',
      transform: 'translateY(0)',
      transition: 'all 200ms',
      '&:hover, &:focus': {
        textDecoration: 'none',
        transform: 'translateY(-3px)',
        boxShadow: `0 40px 40px rgba(0, 0, 0,  .12)`,
      },
    }}
    to={to}
    {...props}
  >
    <CardHeading>{heading}</CardHeading>
    <CardContent>{content}</CardContent>
    <CardCTA />
  </Link>
);

const CardHeading = props => (
  <h3
    css={{
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1,
      marginTop: 0,
      marginBottom: '2rem',
    }}
    {...props}
  />
);

const CardContent = props => (
  <p css={{ lineHeight: 1.4, margin: `0 0 2rem 0`, color: colors.N40, flex: 1 }} {...props} />
);

const CardCTA = () => (
  <div css={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: colors.primary }}>
    <ArrowRight />
    <span css={{ marginLeft: '0.5rem', padding: 0, fontWeight: 600, lineHeight: 1 }}>
      Read more
    </span>
  </div>
);

const ArrowRight = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
};

export { Grid, Card };
