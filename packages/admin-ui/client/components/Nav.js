import React, { Fragment } from 'react';
import { TelescopeIcon, HomeIcon, SignOutIcon } from '@keystonejs/icons';

import {
  Navbar,
  NavGroup,
  NavItem,
  NavSeparator,
} from '@keystonejs/ui/src/primitives/navigation';
import { withAdminMeta } from '../providers/AdminMeta';

const Nav = ({ adminMeta: { lists, listKeys, adminPath } }) => (
  <Navbar>
    <NavGroup>
      <NavItem to={adminPath}>
        <HomeIcon />
      </NavItem>
      {listKeys.map(key => {
        const list = lists[key];
        return (
          <Fragment key={key}>
            <NavSeparator />
            <NavItem to={`${adminPath}/${list.path}`}>{list.label}</NavItem>
          </Fragment>
        );
      })}
    </NavGroup>
    <NavGroup>
      <NavItem to={`${adminPath}/style-guide`}>
        <TelescopeIcon />
      </NavItem>
      <NavSeparator />
      <NavItem to={`${adminPath}/signin`}>
        <SignOutIcon />
      </NavItem>
    </NavGroup>
  </Navbar>
);

export default withAdminMeta(Nav);
