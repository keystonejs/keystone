/* @jsx jsx */

import { jsx, useTheme, H3 } from '@keystone-ui/core';
import Link from 'next/link';

import { useKeystone } from '../context';

export const Logo = () => {
  const { headingStyles } = useTheme();
  const { adminConfig } = useKeystone();

  if (adminConfig.components?.Logo) {
    return <adminConfig.components.Logo />;
  }

  return (
    <H3>
      <Link href="/" passHref>
        <a css={{ color: headingStyles.h3.color, textDecoration: 'none' }}>KeystoneJS</a>
      </Link>
    </H3>
  );
};
