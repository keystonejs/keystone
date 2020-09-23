/* @jsx jsx */

import { jsx } from '@emotion/core';
import { Button } from '@keystone-ui/button';
import { Box, Stack, Inline, useTheme } from '@keystone-ui/core';
import { GithubIcon } from '@keystone-ui/icons/icons/GithubIcon';
import { DatabaseIcon } from '@keystone-ui/icons/icons/DatabaseIcon';
import { useRouter } from 'next/router';
import { FunctionComponent, ReactNode } from 'react';

import { Logo } from './Logo';
import { SignoutButton } from './SignoutButton';
import { useKeystone } from '../KeystoneContext';
import { Link } from '../router';

type NavItemProps = {
  href: string;
  children: ReactNode;
};

const NavItem: FunctionComponent<NavItemProps> = ({ href, children }) => {
  const { palette, spacing, radii, typography } = useTheme();
  const router = useRouter();
  const isSelected = router && router.pathname === href;
  return (
    <Link
      href={href}
      css={{
        textDecoration: 'none',
        position: 'relative',
        borderRadius: radii.medium,
        color: isSelected ? palette.neutral800 : palette.neutral700,
        background: isSelected ? 'white' : 'transparent',
        fontWeight: isSelected ? typography.fontWeight.bold : typography.fontWeight.regular,
        display: 'block',
        padding: `${spacing.small}px ${spacing.medium}px`,
        margin: `0 -${spacing.medium}px`,
        ':hover': isSelected
          ? undefined
          : {
              color: palette.blue600,
              background: 'white',
            },
      }}
    >
      {isSelected && (
        <span
          css={{
            display: 'block',
            position: 'absolute',
            width: 5,
            height: '80%',
            background: palette.blue400,
            borderRadius: radii.medium,
            top: '10%',
            right: 5,
          }}
        />
      )}
      {children}
    </Link>
  );
};

const AuthenticatedItem: FunctionComponent<{
  item: { id: string; label: string };
}> = ({ item }) => {
  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Box paddingY="medium">
        Hello <strong>{item.label}</strong>
      </Box>
      <SignoutButton />
    </div>
  );
};

export const Navigation: FunctionComponent = () => {
  const {
    adminMeta: { lists },
    authenticatedItem,
  } = useKeystone();
  return (
    <Box padding="large">
      <Stack gap="medium" marginTop="medium">
        <Logo />
        <Box>
          {authenticatedItem.state === 'authenticated' && (
            <AuthenticatedItem item={authenticatedItem} />
          )}
        </Box>
        <Stack gap="small">
          <NavItem href="/">Home</NavItem>
          {Object.keys(lists).map(key => {
            const list = lists[key];
            return (
              <NavItem key={key} href={`/${list.path}`}>
                {lists[key].label}
              </NavItem>
            );
          })}
        </Stack>
        <Inline gap="medium">
          <Button as="a" target="_blank" href="/api/graphql">
            <DatabaseIcon />
          </Button>
          <Button as="a" target="_blank" href="https://github.com/keystonejs/keystone">
            <GithubIcon />
          </Button>
        </Inline>
      </Stack>
    </Box>
  );
};
