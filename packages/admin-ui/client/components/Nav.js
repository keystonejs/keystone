/* global ENABLE_DEV_FEATURES */

import React, { Fragment } from 'react';
import { withRouter } from 'react-router';
import {
  HomeIcon,
  TerminalIcon,
  TelescopeIcon,
  MarkGithubIcon,
  SignOutIcon,
} from '@voussoir/icons';

import {
  PrimaryNav,
  PrimaryNavItem,
  NavGroup,
  NavGroupIcons,
  NavSeparator,
} from '@voussoir/ui/src/primitives/navigation';
import { A11yText } from '@voussoir/ui/src/primitives/typography';
import { withAdminMeta } from '../providers/AdminMeta';

const GITHUB_PROJECT = 'https://github.com/keystonejs/keystone-5';

const Nav = props => {
  const {
    adminMeta: { withAuth, getListByKey, listKeys, adminPath, graphiqlPath, signoutPath },
    location,
  } = props;
  return (
    <PrimaryNav>
      <NavGroupIcons>
        <PrimaryNavItem to={adminPath} title="Dashboard">
          <HomeIcon />
          <A11yText>Dashboard</A11yText>
        </PrimaryNavItem>
        {withAuth ? (
          <Fragment>
            <NavSeparator />
            <PrimaryNavItem href={signoutPath} title="Sign Out">
              <SignOutIcon />
              <A11yText>Sign Out</A11yText>
            </PrimaryNavItem>
          </Fragment>
        ) : null}
      </NavGroupIcons>

      <NavGroup>
        {listKeys.map(key => {
          const list = getListByKey(key);
          let href = `${adminPath}/${list.path}`;
          const maybeSearchParam = list.getPersistedSearch();
          if (maybeSearchParam) {
            href += maybeSearchParam;
          }
          const isSelected = href === location.pathname;

          return (
            <Fragment key={key}>
              <PrimaryNavItem id={`ks-nav-${list.path}`} isSelected={isSelected} to={href}>
                {list.label}
              </PrimaryNavItem>
            </Fragment>
          );
        })}
      </NavGroup>

      {ENABLE_DEV_FEATURES ? (
        <NavGroupIcons>
          <Fragment>
            <PrimaryNavItem target="_blank" href={GITHUB_PROJECT} title="GitHub">
              <MarkGithubIcon />
              <A11yText>GitHub</A11yText>
            </PrimaryNavItem>
            <NavSeparator />
            <PrimaryNavItem target="_blank" href={graphiqlPath} title="Graphiql Console">
              <TerminalIcon />
              <A11yText>Graphiql Console</A11yText>
            </PrimaryNavItem>
            <NavSeparator />
            <PrimaryNavItem to={`${adminPath}/style-guide`} title="Style Guide">
              <TelescopeIcon />
              <A11yText>Style Guide</A11yText>
            </PrimaryNavItem>
          </Fragment>
          </NavGroupIcons>
        ) : null}
    </PrimaryNav>
  );
};

export default withRouter(withAdminMeta(Nav));
