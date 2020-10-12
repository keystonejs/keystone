/* @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import type { HTMLAttributes, ReactNode } from 'react';

import { Navigation } from './Navigation';

type PageContainerProps = {
  children: ReactNode;
};

const SIDEBAR_WIDTH = 320;

const PageWrapper = (props: HTMLAttributes<HTMLElement>) => {
  const { colors } = useTheme();
  return <div css={{ backgroundColor: colors.backgroundMuted, display: 'flex' }} {...props} />;
};

const Sidebar = (props: HTMLAttributes<HTMLElement>) => {
  const { colors } = useTheme();

  return (
    <aside
      css={{
        borderRight: `1px solid transparent`,
        boxSizing: 'border-box',
        flexShrink: 0,
        height: '100vh',
        minWidth: 0,
        overflowY: 'auto',
        position: 'sticky',
        top: 0,
        width: SIDEBAR_WIDTH,
        WebkitOverflowScrolling: 'touch',
        transition: 'border-color 100ms ease-in-out',

        ':hover': {
          borderColor: colors.border,
        },
      }}
      {...props}
    />
  );
};

const Content = (props: HTMLAttributes<HTMLElement>) => {
  const { spacing } = useTheme();

  return (
    <div
      css={{
        boxSizing: 'border-box',
        flex: 1,
        minHeight: '100vh',
        minWidth: 1, // resolves collapsing issues in children
        paddingLeft: spacing.xlarge,
        paddingRight: spacing.xlarge,
        paddingBottom: spacing.xlarge,
      }}
      {...props}
    />
  );
};

export const PageContainer = ({ children }: PageContainerProps) => {
  return (
    <PageWrapper>
      <Sidebar>
        <Navigation />
      </Sidebar>
      <Content>{children}</Content>
    </PageWrapper>
  );
};
