/* global ENABLE_DEV_FEATURES */
/** @jsx jsx */

import { Fragment } from 'react';
import { jsx } from '@emotion/core';

import { TerminalIcon, MarkGithubIcon, SignOutIcon } from '@arch-ui/icons';
import { PrimaryNavItem, NavGroupIcons } from '@arch-ui/navbar';
import { A11yText } from '@arch-ui/typography';
import { useAdminMeta } from '../../providers/AdminMeta';

const GITHUB_PROJECT = 'https://github.com/keystonejs/keystone-5';

export function NavIcons() {
  let { graphiqlPath, signoutPath, authStrategy } = useAdminMeta();
  return ENABLE_DEV_FEATURES || authStrategy ? (
    <NavGroupIcons>
      {authStrategy ? (
        <PrimaryNavItem href={signoutPath} title="Sign Out">
          <SignOutIcon />
          <A11yText>Sign Out</A11yText>
        </PrimaryNavItem>
      ) : null}
      {ENABLE_DEV_FEATURES ? (
        <Fragment>
          <PrimaryNavItem target="_blank" href={GITHUB_PROJECT} title="GitHub">
            <MarkGithubIcon />
            <A11yText>GitHub</A11yText>
          </PrimaryNavItem>
          <PrimaryNavItem target="_blank" href={graphiqlPath} title="Graphiql Console">
            <TerminalIcon />
            <A11yText>Graphiql Console</A11yText>
          </PrimaryNavItem>
        </Fragment>
      ) : null}
    </NavGroupIcons>
  ) : null;
}
