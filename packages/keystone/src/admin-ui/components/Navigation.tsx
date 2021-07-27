/* @jsx jsx */

import { AllHTMLAttributes, ReactNode, Fragment } from 'react';
import { useRouter } from 'next/router';
import { NavigationProps, ListMeta } from '@keystone-next/types';
import { Stack, jsx, useTheme, Text } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import { Popover } from '@keystone-ui/popover';
import { MoreHorizontalIcon } from '@keystone-ui/icons/icons/MoreHorizontalIcon';
import { ChevronRightIcon } from '@keystone-ui/icons/icons/ChevronRightIcon';

import { useKeystone } from '../context';
import { Link } from '../router';
import { SignoutButton } from './SignoutButton';

type NavItemProps = {
  href: string;
  children: ReactNode;
  isSelected?: boolean;
};

export const NavItem = ({ href, children, isSelected: _isSelected }: NavItemProps) => {
  const { colors, palette, spacing, radii, typography } = useTheme();
  const router = useRouter();

  const isSelected = _isSelected !== undefined ? _isSelected : router.pathname === href;

  return (
    <li>
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
            background: colors.backgroundHover,
            color: colors.linkHoverColor,
          },

          '&[aria-current=location]': {
            background: palette.neutral200,
            color: palette.neutral900,
          },
        }}
      >
        {children}
      </Link>
    </li>
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
        margin: spacing.xlarge,
        marginBottom: 0,
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
          <PopoverLink target="_blank" href="https://keystonejs.com">
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

export type NavigationContainerProps = Pick<NavigationProps, 'authenticatedItem'> & {
  children: ReactNode;
};

export const NavigationContainer = ({ authenticatedItem, children }: NavigationContainerProps) => {
  const { spacing } = useTheme();
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
      <nav role="navigation" aria-label="Side Navigation" css={{ marginTop: spacing.xlarge }}>
        <ul
          css={{
            padding: 0,
            margin: 0,
            li: {
              listStyle: 'none',
            },
          }}
        >
          {children}
        </ul>
      </nav>
    </div>
  );
};

export const ListNavItem = ({ list }: { list: ListMeta }) => {
  const router = useRouter();
  return (
    <NavItem
      isSelected={router.pathname.split('/')[1] === list.path.split('/')[1]}
      href={`/${list.path}`}
    >
      {list.label}
    </NavItem>
  );
};

type NavItemsProps = Pick<NavigationProps, 'lists'> & { include?: string[] };

export const ListNavItems = ({ lists = [], include = [] }: NavItemsProps) => {
  const renderedList = include.length > 0 ? lists.filter(i => include.includes(i.key)) : lists;

  return (
    <Fragment>
      {renderedList.map((list: ListMeta) => {
        return <ListNavItem key={list.key} list={list} />;
      })}
    </Fragment>
  );
};

export const Navigation = () => {
  const {
    adminMeta: { lists },
    adminConfig,
    authenticatedItem,
    visibleLists,
  } = useKeystone();

  if (visibleLists.state === 'loading') return null;
  // This visible lists error is critical and likely to result in a server restart
  // if it happens, we'll show the error and not render the navigation component/s
  if (visibleLists.state === 'error') {
    return (
      <Text as="span" paddingLeft="xlarge" css={{ color: 'red' }}>
        {visibleLists.error instanceof Error
          ? visibleLists.error.message
          : visibleLists.error[0].message}
      </Text>
    );
  }
  const renderableLists = Object.keys(lists)
    .map(key => {
      if (!visibleLists.lists.has(key)) return null;
      return lists[key];
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  if (adminConfig?.components?.Navigation) {
    return (
      <adminConfig.components.Navigation
        authenticatedItem={authenticatedItem}
        lists={renderableLists}
      />
    );
  }

  return (
    <NavigationContainer authenticatedItem={authenticatedItem}>
      <ListNavItems lists={renderableLists} />
    </NavigationContainer>
  );
};
