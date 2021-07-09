/** @jsx jsx */
import Link from 'next/link';
// import { jsx, H3 } from '@keystone-ui/core';

console.log('REACT IS COMING FROM', require.resolve('react'));

export const CustomLogo = () => {
  return (
    <H3>
      <Link href="/" passHref>
        <a
          css={{
            backgroundImage: `linear-gradient(to right, #0ea5e9, #6366f1)`,
            backgroundClip: 'text',
            lineHeight: '1.75rem',
            color: 'transparent',
            verticalAlign: 'middle',
            transition: 'color 0.3s ease',
            textDecoration: 'none',
          }}
        >
          LegendBoulder After
        </a>
      </Link>
    </H3>
  );
};
