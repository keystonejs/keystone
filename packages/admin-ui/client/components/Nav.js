import React, { Fragment } from 'react';
import { withRouter } from 'react-router';
import {
  HomeIcon,
  TerminalIcon,
  TelescopeIcon,
  MarkGithubIcon,
  SignOutIcon,
} from '@keystonejs/icons';

import {
  PrimaryNav,
  PrimaryNavItem,
  NavGroup,
  NavSeparator,
} from '@keystonejs/ui/src/primitives/navigation';
import { A11yText } from '@keystonejs/ui/src/primitives/typography';
import { withAdminMeta } from '../providers/AdminMeta';

const GITHUB_PROJECT = 'https://github.com/keystonejs/keystone-5';

const Nav = props => {
  const {
    adminMeta: { getListByKey, listKeys, adminPath, graphiqlPath },
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
        <PrimaryNavItem target="_blank" href={GITHUB_PROJECT}>
          <MarkGithubIcon />
        </PrimaryNavItem>
        <NavSeparator />
        <PrimaryNavItem target="_blank" href={graphiqlPath}>
          <TerminalIcon />
        </PrimaryNavItem>
        <NavSeparator />
        <PrimaryNavItem to={`${adminPath}/style-guide`}>
          <TelescopeIcon />
        </PrimaryNavItem>
        <NavSeparator />
        <PrimaryNavItem to={`${adminPath}/signin`} title="Sign Out">
          <SignOutIcon />
          <A11yText>Sign Out</A11yText>
        </PrimaryNavItem>
      </NavGroup>
    </PrimaryNav>
  );
};

export default withRouter(withAdminMeta(Nav));
