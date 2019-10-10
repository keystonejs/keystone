/* global EXPERIMENTAL_FEATURES */
/** @jsx jsx */

import { jsx } from '@emotion/core';

import { TerminalIcon, MarkGithubIcon, SignOutIcon } from '@arch-ui/icons';
import { PrimaryNavItem, NavGroupIcons } from '@arch-ui/navbar';
import { A11yText } from '@arch-ui/typography';
import { useAdminMeta } from '../../providers/AdminMeta';

const GITHUB_PROJECT = 'https://github.com/keystonejs/keystone-5';

export function NavIcons() {
  let { graphiqlPath, signoutPath, authStrategy } = useAdminMeta();
  return (
    <NavGroupIcons>
      {authStrategy ? (
        <PrimaryNavItem href={signoutPath} title="Sign Out">
          <SignOutIcon />
          <A11yText>Sign Out</A11yText>
        </PrimaryNavItem>
      ) : null}

      <PrimaryNavItem target="_blank" href={GITHUB_PROJECT} title="GitHub">
        <MarkGithubIcon />
        <A11yText>GitHub</A11yText>
      </PrimaryNavItem>

      {graphiqlPath ? (
        <PrimaryNavItem target="_blank" href={graphiqlPath} title="Graphiql Console">
          <TerminalIcon />
          <A11yText>Graphiql Console</A11yText>
        </PrimaryNavItem>
      ) : null}
    </NavGroupIcons>
  );
}
