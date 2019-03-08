/** @jsx jsx */

import { Fragment } from 'react';
import { jsx } from '@emotion/core';

import { TerminalIcon, TelescopeIcon, MarkGithubIcon, SignOutIcon } from '@arch-ui/icons';
import { PrimaryNavItem, NavGroupIcons } from '@arch-ui/navbar';
import { A11yText } from '@arch-ui/typography';
import { Link } from '../../providers/Router';
import { useAdminMeta } from '../../providers/AdminMeta';

const GITHUB_PROJECT = 'https://github.com/keystonejs/keystone-5';

export function NavIcons() {
  let { graphiqlPath, withAuth } = useAdminMeta();
  return process.env.ENABLE_DEV_FEATURES || withAuth ? (
    <NavGroupIcons>
      {withAuth ? (
        <Link passHref route="signout">
          <PrimaryNavItem as="a" title="Sign Out">
            <SignOutIcon />
            <A11yText>Sign Out</A11yText>
          </PrimaryNavItem>
        </Link>
      ) : null}
      {process.env.ENABLE_DEV_FEATURES ? (
        <Fragment>
          <Link passHref href={GITHUB_PROJECT}>
            <PrimaryNavItem as="a" target="_blank" title="GitHub">
              <MarkGithubIcon />
              <A11yText>GitHub</A11yText>
            </PrimaryNavItem>
          </Link>
          <Link passHref href={graphiqlPath}>
            <PrimaryNavItem as="a" target="_blank" title="Graphiql Console">
              <TerminalIcon />
              <A11yText>Graphiql Console</A11yText>
            </PrimaryNavItem>
          </Link>
          <Link passHref route="style-guide">
            <PrimaryNavItem as="a" title="Style Guide">
              <TelescopeIcon />
              <A11yText>Style Guide</A11yText>
            </PrimaryNavItem>
          </Link>
        </Fragment>
      ) : null}
    </NavGroupIcons>
  ) : null;
}
