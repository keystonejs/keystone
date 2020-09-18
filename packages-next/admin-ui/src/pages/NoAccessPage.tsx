/* @jsx jsx */

import { ReactNode } from 'react';
import { jsx, Box, Center, Stack, useTheme } from '@keystone-ui/core';
import { AlertTriangleIcon } from '@keystone-ui/icons/icons/AlertTriangleIcon';

export const NoAccessPage = () => {
  return (
    <ErrorContainer>
      <Stack align="center" gap="medium">
        <AlertTriangleIcon size="large" />
        <div>You don't have access to this page.</div>
      </Stack>
    </ErrorContainer>
  );
};

type ErrorContainerProps = {
  children: ReactNode;
};

export const ErrorContainer = ({ children }: ErrorContainerProps) => {
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
