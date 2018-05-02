import React, { Fragment } from 'react';
import { withRouter } from 'react-router';
import { TelescopeIcon, HomeIcon, SignOutIcon } from '@keystonejs/icons';

import {
  PrimaryNav,
  PrimaryNavItem,
  NavGroup,
  NavSeparator,
} from '@keystonejs/ui/src/primitives/navigation';
import { withAdminMeta } from '../providers/AdminMeta';

const Nav = props => {
  const { adminMeta: { lists, listKeys, adminPath }, location } = props;
  return (
    <PrimaryNav>
      <NavGroup>
        <PrimaryNavItem to={adminPath}>
          <HomeIcon />
        </PrimaryNavItem>
        {listKeys.map(key => {
          const list = lists[key];
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
        <PrimaryNavItem to={`${adminPath}/style-guide`}>
          <TelescopeIcon />
        </PrimaryNavItem>
        <NavSeparator />
        <PrimaryNavItem to={`${adminPath}/signin`}>
          <SignOutIcon />
        </PrimaryNavItem>
      </NavGroup>
    </PrimaryNav>
  );
};

export default withRouter(withAdminMeta(Nav));
