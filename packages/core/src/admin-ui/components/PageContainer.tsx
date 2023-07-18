/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import { Dispatch, Fragment, HTMLAttributes, ReactNode, SetStateAction, useState } from 'react';
import { MenuIcon, XCircleIcon } from '@keystone-ui/icons';

import { Navigation } from './Navigation';
import { Logo } from './Logo';

type PageContainerProps = {
  children: ReactNode;
  header: ReactNode;
  title?: string;
};

export const HEADER_HEIGHT = 80;

const PageWrapper = (props: HTMLAttributes<HTMLElement>) => {
  // const { colors } = useTheme();
  return (
    <Fragment>
      {/* TODO: not sure where to put this */}
      <style>{`body { overflow: hidden; }`}</style>
      <div
        css={{
          // background: colors.background,
          display: 'grid',
          gridTemplateColumns: `minmax(300px, 1fr)`,
          gridTemplateRows: `repeat(2,${HEADER_HEIGHT}px) auto`,
          height: '100vh',
          isolation: 'isolate',
          '@media (min-width: 576px)': {
            gridTemplateColumns: `minmax(300px, 1fr) 4fr`,
            gridTemplateRows: `${HEADER_HEIGHT}px auto`,
          },
        }}
        {...props}
      />
    </Fragment>
  );
};

const Sidebar = ({
  isSidebarOpen,
  ...props
}: HTMLAttributes<HTMLElement> & {
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  // const { colors } = useTheme();

  return (
    <div
      css={{
        gridColumn: '1/2',
        gridRow: '1/4',
        display: isSidebarOpen ? 'block' : 'none',
        height: '100vh',
        '@media (min-width: 576px)': {
          gridColumn: '1/2',
          gridRow: '2/3',
          display: 'block',
          height: '100%',
        },
      }}
    >
      <div
        onClick={() => {
          props.setIsSidebarOpen(!isSidebarOpen);
        }}
        css={{
          float: 'right',
          padding: '10px',
          display: 'block',
          '@media (min-width: 576px)': { display: 'none' },
        }}
      >
        <XCircleIcon />
      </div>
      <aside
        css={{
          // borderRight: `1px solid ${colors.border}`,
          minWidth: 0, // resolves collapsing issues in children
          WebkitOverflowScrolling: 'touch',
        }}
        {...props}
      />
    </div>
  );
};

const Content = (props: HTMLAttributes<HTMLElement>) => {
  const { colors, spacing } = useTheme();

  return (
    <main
      css={{
        backgroundColor: colors.background,
        boxSizing: 'border-box',
        minWidth: 0, // resolves collapsing issues in children
        paddingLeft: spacing.xlarge,
        paddingRight: spacing.xlarge,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        position: 'relative',
      }}
      {...props}
    />
  );
};

export const PageContainer = ({ children, header, title }: PageContainerProps) => {
  const { colors, spacing } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <PageWrapper>
      <div
        css={{
          alignItems: 'center',
          // borderRight: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          paddingLeft: spacing.xlarge,
          paddingRight: spacing.xlarge,
        }}
      >
        <Logo />
        <div
          onClick={() => {
            setIsSidebarOpen(!isSidebarOpen);
          }}
          css={{ display: 'block', '@media (min-width: 576px)': { display: 'none' } }}
        >
          <MenuIcon />
        </div>
      </div>
      <header
        css={{
          alignItems: 'center',
          backgroundColor: colors.background,
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          minWidth: 0, // fix flex text truncation
          paddingLeft: spacing.xlarge,
          paddingRight: spacing.xlarge,
        }}
      >
        <title>{title ? `Keystone - ${title}` : 'Keystone'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {header}
      </header>
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
        <Navigation />
      </Sidebar>
      <Content>{children}</Content>
    </PageWrapper>
  );
};
