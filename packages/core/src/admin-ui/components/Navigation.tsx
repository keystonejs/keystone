/** @jsxRuntime classic */
/** @jsx jsx */

import { AllHTMLAttributes, ReactNode, Fragment } from 'react';
import { useRouter } from 'next/router';
import { Stack, jsx, useTheme, Text } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import { Popover } from '@keystone-ui/popover';
import { MoreHorizontalIcon } from '@keystone-ui/icons/icons/MoreHorizontalIcon';
import { ChevronRightIcon } from '@keystone-ui/icons/icons/ChevronRightIcon';
import { NavigationProps, ModelMeta, AuthenticatedItem } from '../../types';

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

const AuthenticatedItemDialog = ({ item }: { item: AuthenticatedItem | undefined }) => {
  const { apiPath } = useKeystone();
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
      {item && item.state === 'authenticated' ? (
        <div css={{ fontSize: typography.fontSize.small }}>
          Signed in as <strong css={{ display: 'block' }}>{item.label}</strong>
        </div>
      ) : (
        process.env.NODE_ENV !== 'production' && (
          <div css={{ fontSize: typography.fontSize.small }}>GraphQL Playground and Docs</div>
        )
      )}

      {process.env.NODE_ENV === 'production' ? (
        item && item.state === 'authenticated' && <SignoutButton />
      ) : (
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
            <PopoverLink target="_blank" href={apiPath}>
              API Explorer
            </PopoverLink>
            <PopoverLink target="_blank" href="https://github.com/keystonejs/keystone">
              GitHub Repository
            </PopoverLink>
            <PopoverLink target="_blank" href="https://keystonejs.com">
              Keystone Documentation
            </PopoverLink>
            {item && item.state === 'authenticated' && <SignoutButton />}
          </Stack>
        </Popover>
      )}
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

export type NavigationContainerProps = Partial<Pick<NavigationProps, 'authenticatedItem'>> & {
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
        position: 'relative',
      }}
    >
      <AuthenticatedItemDialog item={authenticatedItem} />
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

export const ModelItem = ({ model }: { model: ModelMeta }) => {
  const router = useRouter();
  return (
    <NavItem
      isSelected={router.pathname.split('/')[1] === `/${model.path}`.split('/')[1]}
      href={`/${model.path}`}
    >
      {model.label}
    </NavItem>
  );
};

type NavItemsProps = Pick<NavigationProps, 'models'> & { include?: string[] };

export const ModelNavItems = ({ models = [], include = [] }: NavItemsProps) => {
  const renderedModels = include.length > 0 ? models.filter(i => include.includes(i.key)) : models;

  return (
    <Fragment>
      {renderedModels.map((models: ModelMeta) => {
        return <ModelItem key={models.key} model={models} />;
      })}
    </Fragment>
  );
};

export const Navigation = () => {
  const {
    adminMeta: { models },
    adminConfig,
    authenticatedItem,
    visibleModels,
  } = useKeystone();

  if (visibleModels.state === 'loading') return null;
  // This visible models error is critical and likely to result in a server restart
  // if it happens, we'll show the error and not render the navigation component/s
  if (visibleModels.state === 'error') {
    return (
      <Text as="span" paddingLeft="xlarge" css={{ color: 'red' }}>
        {visibleModels.error instanceof Error
          ? visibleModels.error.message
          : visibleModels.error[0].message}
      </Text>
    );
  }
  const renderableModels = Object.keys(models)
    .map(key => {
      if (!visibleModels.models.has(key)) return null;
      return models[key];
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  if (adminConfig?.components?.Navigation) {
    return (
      <adminConfig.components.Navigation
        authenticatedItem={authenticatedItem}
        models={renderableModels}
      />
    );
  }

  return (
    <NavigationContainer authenticatedItem={authenticatedItem}>
      <NavItem href="/">Dashboard</NavItem>
      <ModelNavItems models={renderableModels} />
    </NavigationContainer>
  );
};
