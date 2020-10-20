/* @jsx jsx */

import { ReactNode } from 'react';
import { Box, jsx } from '@keystone-ui/core';

type FieldContainerProps = {
  children: ReactNode;
  className?: string;
};

export const FieldContainer = ({ children, ...props }: FieldContainerProps) => {
  return (
    <Box marginY="medium" {...props}>
      {children}
    </Box>
  );
};
