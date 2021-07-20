/* @jsx jsx */

import { AllHTMLAttributes, ReactNode, Fragment } from 'react';
import { useRouter } from 'next/router';
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

  // Split out router.pathname.split ..... into ListNavItem specific logic.
  const isSelected = _isSelected !== undefined ? _isSelected : router.pathname === href;

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

export type NavigationProps = Pick<ReturnType<typeof useKeystone>, 'authenticatedItem'> & {
  routes: ReturnType<typeof getRenderableRoutes>;
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
      <nav css={{ marginTop: spacing.xlarge }}>{children}</nav>
    </div>
  );
};

type ListNavItemsProps = Pick<NavigationProps, 'routes'>;

const ListNavItem = ({ href, children }: { href: string; children: ReactNode }) => {
  const router = useRouter();
  return (
    <NavItem isSelected={router.pathname.split('/')[1] === href.split('/')[1]} href={href}>
      {children}
    </NavItem>
  );
};

export const ListNavItems = ({ routes }: ListNavItemsProps) => {
  // pull this logic up into a hook (or shared functionality);
  if (!routes) return null;

  if (routes.state === 'error' && 'error' in routes) {
    return (
      <Text as="span" paddingLeft="xlarge" css={{ color: 'red' }}>
        {routes.error}
      </Text>
    );
  }

  return (
    <Fragment>
      {(routes as ListSuccess).data.map(
        ({ path, key, label }: { path: string; key: string; label: string }) => {
          return (
            <ListNavItem key={key} href={path}>
              {label}
            </ListNavItem>
          );
        }
      )}
    </Fragment>
  );
};

type ListError = { state: 'error'; error: string };
type ListSuccess = {
  state: string;
  data: Array<{ path: string; key: string; label: string }>;
};

const getRenderableRoutes = (
  listMap: any,
  visibleLists: Pick<ReturnType<typeof useKeystone>, 'visibleLists'>['visibleLists']
): ListError | ListSuccess | null => {
  if (visibleLists.state === 'loading') return null;
  if (visibleLists.state === 'error') {
    return {
      state: visibleLists.state,
      error:
        visibleLists.error instanceof Error
          ? visibleLists.error.message
          : visibleLists.error[0].message,
    };
  }

  const routesFromLists = Object.keys(listMap)
    .map(key => {
      if (!visibleLists.lists.has(key)) return null;
      return { path: `/${listMap[key].path}`, key, label: listMap[key].label };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  return {
    state: visibleLists.state,
    data: [{ path: '/', key: 'dashboard', label: 'Dashboard' }, ...routesFromLists],
  };
};

export const Navigation = () => {
  const {
    adminMeta: { lists },
    adminConfig,
    authenticatedItem,
    visibleLists,
  } = useKeystone();

  const renderableLists = getRenderableRoutes(lists, visibleLists);
  // Visible Lists filtering here.
  if (adminConfig?.components?.Navigation) {
    return (
      <adminConfig.components.Navigation
        authenticatedItem={authenticatedItem}
        routes={renderableLists}
      />
    );
  }
  return (
    <NavigationContainer authenticatedItem={authenticatedItem}>
      <ListNavItems routes={renderableLists} />
    </NavigationContainer>
  );
};
