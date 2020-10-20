/* @jsx jsx */

import { ReactNode } from 'react';
import { Box, jsx, useTheme } from '@keystone-ui/core';

type FieldContainerProps = {
  children: ReactNode;
  className?: string;
};

export const FieldContainer = ({ children, ...props }: FieldContainerProps) => {
  const { colors } = useTheme();
  return (
    <Box
      marginY="medium"
      // paddingX="medium"
      // css={{ borderLeft: `4px solid ${colors.backgroundDim}` }}
      {...props}
    >
      {children}
    </Box>
  );
};
