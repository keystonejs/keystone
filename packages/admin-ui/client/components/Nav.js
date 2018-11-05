/* global ENABLE_DEV_FEATURES */

import React, { Fragment } from 'react';
import { withRouter } from 'react-router';
import styled from '@emotion/styled';
import { TerminalIcon, TelescopeIcon, MarkGithubIcon, SignOutIcon } from '@voussoir/icons';

import {
  BrandItem,
  PrimaryNav,
  PrimaryNavItem,
  NavGroup,
  NavGroupIcons,
  NavSeparator,
} from '@voussoir/ui/src/primitives/navigation';
import { A11yText } from '@voussoir/ui/src/primitives/typography';
import { colors, gridSize } from '@voussoir/ui/src/theme';
import { withAdminMeta } from '../providers/AdminMeta';
import ResizeHandler from './ResizeHandler';

const GITHUB_PROJECT = 'https://github.com/keystonejs/keystone-5';

const Page = styled.div({
  flex: 1,
  minHeight: '100vh',
});
const PageWrapper = styled.div({
  display: 'flex',
});
const Shadow = styled.div({
  backgroundColor: colors.N10,
  bottom: gridSize * 2,
  cursor: 'ew-resize',
  position: 'fixed',
  right: 0,
  top: gridSize * 2,
  transition: 'background-color 200ms',
  width: 2,

  ':hover': {
    backgroundColor: colors.N20,
  },
  ':active': {
    backgroundColor: colors.N30,
  },

  ':before': {
    bottom: -gridSize,
    content: '" "',
    left: -gridSize,
    position: 'absolute',
    right: -gridSize,
    top: -gridSize,
  },
});

function getPath(str) {
  const arr = str.split('/');
  return `/${arr[1]}/${arr[2]}`;
}

class Nav extends React.Component {
  state = { width: 240 };
  render() {
    const {
      adminMeta: { adminPath, getListByKey, graphiqlPath, listKeys, name, signoutPath, withAuth },
      children,
      location,
    } = this.props;
    const { width } = this.state;

    return (
      <ResizeHandler>
        {(handlers, state) => (
          <PageWrapper>
            <PrimaryNav style={{ width: state.width }}>
              <NavGroupIcons>
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
                <BrandItem>{name}</BrandItem>
                <PrimaryNavItem to={adminPath} isSelected={location.pathname == adminPath}>
                  Dashboard
                </PrimaryNavItem>

                {listKeys.map(key => {
                  const list = getListByKey(key);
                  const href = `${adminPath}/${list.path}`;
                  const path = getPath(location.pathname);
                  const isSelected = href === path;

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
            <Shadow {...handlers} style={{ left: state.width }} />
            <Page style={{ paddingLeft: state.width }}>{children}</Page>
          </PageWrapper>
        )}
      </ResizeHandler>
    );
  }
}

export default withRouter(withAdminMeta(Nav));
