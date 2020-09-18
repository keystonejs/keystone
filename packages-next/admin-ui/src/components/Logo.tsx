/* @jsx jsx */

import { jsx } from '@emotion/core';
import { useTheme } from '@keystone-ui/core';
import Link from 'next/link';

import { useKeystone } from '../KeystoneContext';

export const Logo = () => {
  const { colors } = useTheme();
  const { adminConfig } = useKeystone();
  if (adminConfig.components?.Logo) {
    return <adminConfig.components.Logo />;
  }
  return (
    <h1 css={{ margin: 0 }}>
      <Link href="/">
        <a css={{ color: colors.foreground }}>KeystoneJS</a>
      </Link>
    </h1>
  );
};
