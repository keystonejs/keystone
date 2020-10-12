/* @jsx jsx */

import { jsx, useTheme, H2 } from '@keystone-ui/core';
import Link from 'next/link';

import { useKeystone } from '../context';

export const Logo = () => {
  const { colors } = useTheme();
  const { adminConfig } = useKeystone();
  if (adminConfig.components?.Logo) {
    return <adminConfig.components.Logo />;
  }
  return (
    <H2>
      <Link href="/">
        <a css={{ color: colors.foreground }}>KeystoneJS</a>
      </Link>
    </H2>
  );
};
