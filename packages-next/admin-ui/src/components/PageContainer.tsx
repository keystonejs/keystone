/* @jsx jsx */

import { jsx } from '@emotion/core';
import { ReactNode } from 'react';

import { Box } from '@keystone-ui/core';

type PageContainerProps = {
  children: ReactNode;
};

export const PageContainer = ({ children }: PageContainerProps) => {
  return <Box margin="medium">{children}</Box>;
};
