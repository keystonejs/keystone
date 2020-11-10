/* @jsx jsx */

import { Button } from '@keystone-ui/button';
import { jsx, Inline, useTheme } from '@keystone-ui/core';
import { GithubIcon } from '@keystone-ui/icons/icons/GithubIcon';
import { DatabaseIcon } from '@keystone-ui/icons/icons/DatabaseIcon';
import type { HTMLAttributes, ReactNode } from 'react';

import { Navigation } from './Navigation';
import { Logo } from './Logo';

type PageContainerProps = {
  children: ReactNode;
  header: ReactNode;
};

export const HEADER_HEIGHT = 80;

const PageWrapper = (props: HTMLAttributes<HTMLElement>) => {
  const { colors } = useTheme();
  return (
    <div
      css={{
        backgroundColor: colors.backgroundMuted,
        display: 'grid',
        gridTemplateColumns: `minmax(280px, 320px) auto`,
        gridTemplateRows: `${HEADER_HEIGHT}px auto`,
        height: '100vh',
      }}
      {...props}
    />
  );
};

const Sidebar = (props: HTMLAttributes<HTMLElement>) => {
  const { colors } = useTheme();

  return (
    <aside
      css={{
        borderRight: `1px solid ${colors.border}`,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        justifyContent: 'space-between',
        minWidth: 1, // resolves collapsing issues in children
        overflowY: 'auto',
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
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        minWidth: 1, // resolves collapsing issues in children
        paddingLeft: spacing.xlarge,
        paddingRight: spacing.xlarge,
        paddingTop: spacing.xlarge,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
      {...props}
    />
  );
};

export const PageContainer = ({ children, header }: PageContainerProps) => {
  const { colors, spacing } = useTheme();
  return (
    <PageWrapper>
      <div
        css={{
          alignItems: 'center',
          backgroundColor: colors.backgroundMuted,
          borderRight: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          paddingLeft: spacing.xlarge,
          paddingRight: spacing.xlarge,
        }}
      >
        <Logo />
      </div>
      <header
        css={{
          alignItems: 'center',
          backgroundColor: colors.background,
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          paddingLeft: spacing.xlarge,
          paddingRight: spacing.xlarge,
        }}
      >
        {header}
      </header>
      <Sidebar>
        <Navigation />
        <Inline gap="medium" padding="xlarge">
          <Button as="a" target="_blank" href="/api/graphql">
            <DatabaseIcon />
          </Button>
          <Button as="a" target="_blank" href="https://github.com/keystonejs/keystone">
            <GithubIcon />
          </Button>
        </Inline>
      </Sidebar>
      <Content>{children}</Content>
    </PageWrapper>
  );
};
