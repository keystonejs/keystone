/* @jsx jsx */

import { AllHTMLAttributes, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { Stack, jsx, useTheme } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import { Popover } from '@keystone-ui/popover';
import { MoreHorizontalIcon } from '@keystone-ui/icons/icons/MoreHorizontalIcon';
import { ChevronRightIcon } from '@keystone-ui/icons/icons/ChevronRightIcon';

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
      aria-current={isSelected ? 'location' : false}
      href={href}
      css={{
        background: 'transparent',
        borderBottomRightRadius: radii.xsmall,
        borderTopRightRadius: radii.xsmall,
        color: palette.neutral700,
        display: 'block',
        fontWeight: typography.fontWeight.medium,
        marginBottom: spacing.xsmall,
        marginRight: spacing.xlarge,
        padding: `${spacing.small}px ${spacing.xlarge}px`,
        position: 'relative',
        textDecoration: 'none',

        ':hover': {
          background: palette.blue50,
          color: palette.blue500,
        },

        '&[aria-current=location]': {
          background: palette.neutral200,
          color: palette.neutral900,
        },
      }}
    >
      {children}
    </Link>
  );
};

const AuthenticatedItem = ({ item }: { item: { id: string; label: string } }) => {
  const { spacing, typography } = useTheme();
  return (
    <div
      css={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: spacing.xlarge,
      }}
    >
      <div css={{ fontSize: typography.fontSize.small }}>
        Signed in as <strong>{item.label}</strong>
      </div>
      <Popover
        placement="bottom"
        triggerRenderer={({ triggerProps }) => (
          <Button
            size="small"
            style={{ padding: 0, width: 36 }}
            aria-label="Links and signout"
            {...triggerProps}
          >
            <MoreHorizontalIcon />
          </Button>
        )}
      >
        <Stack gap="medium" padding="large" dividers="between">
          {/* FIXME: Use config.graphql.path */}
          <PopoverLink target="_blank" href="/api/graphql">
            API Explorer
          </PopoverLink>
          <PopoverLink target="_blank" href="https://github.com/keystonejs/keystone">
            GitHub Repository
          </PopoverLink>
          <PopoverLink target="_blank" href="https://www.keystonejs.com/documentation">
            Keystone Documentation
          </PopoverLink>
          <SignoutButton />
        </Stack>
      </Popover>
    </div>
  );
};

const PopoverLink = ({ children, ...props }: AllHTMLAttributes<HTMLAnchorElement>) => {
  const { typography } = useTheme();

  return (
    <a
      css={{
        alignItems: 'center',
        display: 'flex',
        fontSize: typography.fontSize.small,
        textDecoration: 'none',
      }}
      {...props}
    >
      {children}
      <ChevronRightIcon size="small" />
    </a>
  );
};

export const Navigation = () => {
  const {
    adminMeta: { lists },
    authenticatedItem,
    visibleLists,
  } = useKeystone();

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {authenticatedItem.state === 'authenticated' && (
        <AuthenticatedItem item={authenticatedItem} />
      )}
      <nav>
        <NavItem href="/">Dashboard</NavItem>
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
      </nav>
    </div>
  );
};
