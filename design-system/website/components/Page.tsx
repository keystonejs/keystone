/** @jsxRuntime classic */
/** @jsx jsx */

import type { HTMLAttributes, ReactNode } from 'react';
import { jsx, useTheme } from '@keystone-ui/core';

import { Navigation } from './Navigation';

const SIDEBAR_WIDTH = 320;

const PageWrapper = (props: HTMLAttributes<HTMLElement>) => (
  <div css={{ display: 'flex' }} {...props} />
);

const Sidebar = (props: HTMLAttributes<HTMLElement>) => {
  const { palette, spacing } = useTheme();

  return (
    <aside
      css={{
        backgroundColor: palette.neutral100,
        borderRight: `1px solid ${palette.neutral400}`,
        boxSizing: 'border-box',
        flexShrink: 0,
        height: '100vh',
        minWidth: 0,
        paddingLeft: spacing.xlarge,
        paddingRight: spacing.xlarge,
        overflowY: 'auto',
        position: 'sticky',
        top: 0,
        width: SIDEBAR_WIDTH,
        WebkitOverflowScrolling: 'touch',
      }}
      {...props}
    />
  );
};

const Content = (props: HTMLAttributes<HTMLElement>) => {
  const { colors, spacing } = useTheme();

  return (
    <div
      css={{
        backgroundColor: colors.background,
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

export const Page = ({ children }: { children: ReactNode }) => {
  return (
    <PageWrapper>
      <Sidebar>
        <Navigation />
      </Sidebar>
      <Content>{children}</Content>
    </PageWrapper>
  );
};
