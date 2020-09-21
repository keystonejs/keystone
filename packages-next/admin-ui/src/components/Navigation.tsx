/* @jsx jsx */

import { jsx } from '@emotion/core';
import { useTheme } from '@keystone-ui/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { FunctionComponent, ReactNode } from 'react';

import { Logo } from './Logo';
import { useKeystone } from '../KeystoneContext';

const NavBar: FunctionComponent = ({ children }) => {
  const { colors } = useTheme();
  return (
    <ul
      css={{
        background: colors.backgroundDim,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        margin: 0,
        padding: 0,
      }}
    >
      {children}
    </ul>
  );
};

type NavItemProps = {
  href: string;
  children: ReactNode;
};

const NavItem: FunctionComponent<NavItemProps> = ({ href, children }) => {
  const { palette, spacing, radii } = useTheme();
  const router = useRouter();
  const isSelected = router && router.pathname === href;
  return (
    <li
      css={{
        listStyle: 'none',
        display: 'inline-block',
        margin: spacing.xsmall,
      }}
    >
      <Link href={href} passHref>
        <a
          css={{
            textDecoration: 'none',
            borderRadius: radii.medium,
            color: isSelected ? palette.blue100 : palette.blue700,
            background: isSelected ? palette.blue700 : 'transparent',
            display: 'inline-block',
            padding: `${spacing.small}px ${spacing.medium}px`,
            ':hover': isSelected
              ? undefined
              : {
                  color: palette.blue600,
                  background: palette.neutral100,
                },
          }}
        >
          {children}
        </a>
      </Link>
    </li>
  );
};

export const Navigation: FunctionComponent = () => {
  const {
    adminMeta: { lists },
    authenticatedItem,
  } = useKeystone();
  const { spacing } = useTheme();
  return (
    <div
      css={{
        margin: `-${spacing.medium}px -${spacing.medium}px ${spacing.medium}px -${spacing.medium}px`,
      }}
    >
      <div css={{ padding: spacing.medium }}>
        <Logo />
        {authenticatedItem.state === 'authenticated'
          ? `You're logged in as ${authenticatedItem.label}`
          : authenticatedItem.state}
      </div>
      <NavBar>
        <NavItem href="/">Home</NavItem>
        {Object.keys(lists).map(key => {
          const list = lists[key];
          return (
            <NavItem key={key} href={`/${list.path}`}>
              {lists[key].label}
            </NavItem>
          );
        })}
      </NavBar>
    </div>
  );
};
