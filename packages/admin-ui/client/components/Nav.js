/* global ENABLE_DEV_FEATURES */

import React, { Fragment } from 'react';
import { withRouter } from 'react-router';
import PropToggle from 'react-prop-toggle';
import styled from '@emotion/styled';
import { TerminalIcon, TelescopeIcon, MarkGithubIcon, SignOutIcon } from '@voussoir/icons';

import {
  PrimaryNav,
  PrimaryNavItem,
  NavGroup,
  NavGroupIcons,
  NavSeparator,
} from '@voussoir/ui/src/primitives/navigation';
import { A11yText, Title } from '@voussoir/ui/src/primitives/typography';
import { colors, gridSize } from '@voussoir/ui/src/theme';
import { withAdminMeta } from '../providers/AdminMeta';
import ResizeHandler from './ResizeHandler';

const GITHUB_PROJECT = 'https://github.com/keystonejs/keystone-5';

// function camelToKebab(input: string) {
//   return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
// }
function kebabToCamel(input: string) {
  return input.replace(/-([a-z])/g, function(g) {
    return g[1].toUpperCase();
  });
}

const Page = styled.div({
  flex: 1,
  minHeight: '100vh',
});
const PageWrapper = styled.div({
  display: 'flex',
});
const Shadow = styled.div({
  background: `linear-gradient(to left,
    rgba(0, 0, 0, 0.1) 0px,
    rgba(0, 0, 0, 0.1) 1px,
    rgba(0, 0, 0, 0.05) 1px,
    rgba(0, 0, 0, 0) 100%
  )`,
  bottom: 0,
  pointerEvents: 'none',
  position: 'fixed',
  top: 0,
  transform: 'translateX(-3px)',
  width: 3,
});
const GrabHandle = styled.div({
  bottom: 0,
  cursor: 'col-resize',
  position: 'fixed',
  right: 0,
  top: 0,
  transition: 'background-color 200ms',
  transitionDelay: '200ms',
  width: 2,

  ':hover': {
    backgroundColor: colors.B.L30,
  },
  ':active': {
    backgroundColor: colors.B.L10,
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

function Nav(props) {
  const {
    adminMeta: { adminPath, getListByKey, graphiqlPath, listKeys, name, signoutPath, withAuth },
    children,
    location,
  } = props;

  return (
    <ResizeHandler>
      {(handlers, state) => {
        const navWidth = state.width;
        const makeResizeStyles = key => {
          const pointers = state.isDragging ? { pointerEvents: 'none' } : null;
          return { [kebabToCamel(key)]: navWidth, ...pointers };
        };

        console.log('state.isDragging');

        return (
          <PageWrapper>
            <PropToggle
              isActive={state.isDragging}
              styles={{
                cursor: 'col-resize',
                'user-select': 'none',
              }}
            />
            <PrimaryNav style={makeResizeStyles('width')}>
              <NavGroup>
                <Title as="div" margin="both">
                  {name}
                </Title>
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

              {ENABLE_DEV_FEATURES || withAuth ? (
                <NavGroupIcons>
                  {withAuth ? (
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
                  ) : null}
                </NavGroupIcons>
              ) : null}
            </PrimaryNav>
            <Shadow style={makeResizeStyles('left')} />
            <GrabHandle {...handlers} style={makeResizeStyles('left')} />
            <Page style={makeResizeStyles('padding-left')}>{children}</Page>
          </PageWrapper>
        );
      }}
    </ResizeHandler>
  );
}

export default withRouter(withAdminMeta(Nav));
