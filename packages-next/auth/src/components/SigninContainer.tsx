/* @jsx jsx */

import { ReactNode } from 'react';

import { jsx, Box, Center, useTheme } from '@keystone-ui/core';

type SigninContainerProps = {
  children: ReactNode;
};

export const SigninContainer = ({ children }: SigninContainerProps) => {
  const { colors, shadow } = useTheme();
  return (
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
          minWidth: 600,
          boxShadow: shadow.s100,
        }}
        margin="medium"
        padding="xlarge"
        rounding="medium"
      >
        {children}
      </Box>
    </Center>
  );
};
