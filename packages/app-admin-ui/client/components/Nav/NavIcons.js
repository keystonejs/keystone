/* global ENABLE_DEV_FEATURES */
/** @jsx jsx */

import { Fragment } from 'react';
import { jsx } from '@emotion/core';

import { TerminalIcon, MarkGithubIcon, SignOutIcon } from '@arch-ui/icons';
import { NavIcon, NavGroupIcons } from '@arch-ui/navbar';
import { A11yText } from '@arch-ui/typography';
import { useAdminMeta } from '../../providers/AdminMeta';

const GITHUB_PROJECT = 'https://github.com/keystonejs/keystone';

export function NavIcons() {
  let { graphiqlPath, signoutPath, authStrategy } = useAdminMeta();
  return ENABLE_DEV_FEATURES || authStrategy ? (
    <NavGroupIcons>
      {authStrategy ? (
        <NavIcon href={signoutPath} title="Sign Out">
          <SignOutIcon />
          <A11yText>Sign Out</A11yText>
        </NavIcon>
      ) : null}
      {ENABLE_DEV_FEATURES ? (
        <Fragment>
          <NavIcon target="_blank" href={GITHUB_PROJECT} title="GitHub">
            <MarkGithubIcon />
            <A11yText>GitHub</A11yText>
          </NavIcon>
          <NavIcon target="_blank" href={graphiqlPath} title="Graphiql Console">
            <TerminalIcon />
            <A11yText>Graphiql Console</A11yText>
          </NavIcon>
        </Fragment>
      ) : null}
    </NavGroupIcons>
  ) : null;
}
