/** @jsxRuntime classic */
/** @jsx jsx */

import { ReactNode } from 'react';

import { jsx, Box, Center, useTheme } from '@keystone-ui/core';

type SigninContainerProps = {
  children: ReactNode;
  title?: string;
};

export const SigninContainer = ({ children, title }: SigninContainerProps) => {
  const { colors, shadow } = useTheme();
  return (
    <div>
      <head>
        <title>{title || 'Keystone'}</title>
      </head>
      <Center
        css={{
          minWidth: '100vw',
          minHeight: '100vh',
          backgroundColor: colors.backgroundMuted,
        }}
        rounding="medium"
      >
        <Box
          css={{
            background: colors.background,
            width: 600,
            boxShadow: shadow.s100,
          }}
          margin="medium"
          padding="xlarge"
          rounding="medium"
        >
          {children}
        </Box>
      </Center>
    </div>
  );
};
