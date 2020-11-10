/* @jsx jsx */

import { jsx, Box, Stack, Inline, useTheme } from '@keystone-ui/core';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

import { SignoutButton } from './SignoutButton';
import { useKeystone } from '../context';
import { Link } from '../router';

type NavItemProps = {
  href: string;
  children: ReactNode;
};

const NavItem = ({ href, children }: NavItemProps) => {
  const { palette, spacing, radii, typography } = useTheme();
  const router = useRouter();
  const isSelected =
    router.pathname === href || router.pathname.split('/')[1] === href.split('/')[1];

  return (
    <Link
      data-selected={isSelected}
      href={href}
      css={{
        background: 'transparent',
        borderRadius: radii.small,
        color: palette.neutral700,
        display: 'block',
        fontWeight: typography.fontWeight.medium,
        marginBottom: 1,
        padding: `${spacing.small}px ${spacing.medium}px`,
        position: 'relative',
        textDecoration: 'none',

        ':hover': {
          background: palette.neutral200,
          color: palette.blue600,
        },

        '&[data-selected=true]': {
          background: palette.neutral300,
          color: palette.neutral800,
        },
      }}
    >
      {children}
    </Link>
  );
};

const AuthenticatedItem = ({ item }: { item: { id: string; label: string } }) => {
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

export const Navigation = () => {
  const {
    adminMeta: { lists },
    authenticatedItem,
    visibleLists,
  } = useKeystone();
  const { spacing } = useTheme();

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: spacing.large,
      }}
    >
      <Stack gap="medium">
        <div>
          {authenticatedItem.state === 'authenticated' && (
            <AuthenticatedItem item={authenticatedItem} />
          )}
          <NavItem href="/">Home</NavItem>
          {(() => {
            if (visibleLists.state === 'loading') return null;
            if (visibleLists.state === 'error') {
              return (
                <span css={{ color: 'red' }}>
                  {visibleLists.error instanceof Error
                    ? visibleLists.error.message
                    : visibleLists.error[0].message}
                </span>
              );
            }
            return Object.keys(lists).map(key => {
              if (!visibleLists.lists.has(key)) {
                return null;
              }

              const list = lists[key];
              return (
                <NavItem key={key} href={`/${list.path}`}>
                  {lists[key].label}
                </NavItem>
              );
            });
          })()}
        </div>
      </Stack>
    </div>
  );
};
