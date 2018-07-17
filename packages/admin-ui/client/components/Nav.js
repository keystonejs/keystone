/* global ENABLE_DEV_FEATURES */

import React, { Fragment } from 'react';
import { withRouter } from 'react-router';
import {
  HomeIcon,
  TerminalIcon,
  TelescopeIcon,
  MarkGithubIcon,
  SignOutIcon,
  SignInIcon,
  EllipsisIcon,
} from '@keystonejs/icons';

import {
  PrimaryNav,
  PrimaryNavItem,
  NavGroup,
  NavSeparator,
} from '@keystonejs/ui/src/primitives/navigation';
import { A11yText } from '@keystonejs/ui/src/primitives/typography';
import { withAdminMeta } from '../providers/AdminMeta';
import SessionProvider from '../providers/Session';

const GITHUB_PROJECT = 'https://github.com/keystonejs/keystone-5';

const Nav = props => {
  const {
    adminMeta: {
      withAuth,
      getListByKey,
      listKeys,
      adminPath,
      graphiqlPath,
      signoutPath,
    },
    location,
  } = props;
  return (
    <PrimaryNav>
      <NavGroup>
        <PrimaryNavItem to={adminPath} title="Dashboard">
          <HomeIcon />
          <A11yText>Dashboard</A11yText>
        </PrimaryNavItem>
        {listKeys.map(key => {
          const list = getListByKey(key);
          const href = `${adminPath}/${list.path}`;
          const isSelected = href === location.pathname;

          return (
            <Fragment key={key}>
              <NavSeparator isSelected={isSelected} />
              <PrimaryNavItem isSelected={isSelected} to={href}>
                {list.label}
              </PrimaryNavItem>
            </Fragment>
          );
        })}
      </NavGroup>
      <NavGroup>
        {ENABLE_DEV_FEATURES ? (
          <Fragment>
            <PrimaryNavItem
              target="_blank"
              href={GITHUB_PROJECT}
              title="GitHub"
            >
              <MarkGithubIcon />
              <A11yText>GitHub</A11yText>
            </PrimaryNavItem>
            <NavSeparator />
            <PrimaryNavItem
              target="_blank"
              href={graphiqlPath}
              title="Graphiql Console"
            >
              <TerminalIcon />
              <A11yText>Graphiql Console</A11yText>
            </PrimaryNavItem>
            <NavSeparator />
            <PrimaryNavItem to={`${adminPath}/style-guide`} title="Style Guide">
              <TelescopeIcon />
              <A11yText>Style Guide</A11yText>
            </PrimaryNavItem>
            <NavSeparator />
          </Fragment>
        ) : null}
        {withAuth ? (
          <PrimaryNavItem href={signoutPath} title="Sign Out">
            <SignOutIcon />
            <A11yText>Sign Out</A11yText>
          </PrimaryNavItem>
        ) : null}
      </NavGroup>
    </PrimaryNav>
  );
};

export default withRouter(withAdminMeta(Nav));
