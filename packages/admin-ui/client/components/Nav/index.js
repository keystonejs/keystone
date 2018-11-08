/* global ENABLE_DEV_FEATURES */

import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router';
import PropToggle from 'react-prop-toggle';
import styled from '@emotion/styled';

import {
  TerminalIcon,
  TriangleLeftIcon,
  TriangleRightIcon,
  TelescopeIcon,
  MarkGithubIcon,
  SignOutIcon,
} from '@voussoir/icons';
import { colors, gridSize } from '@voussoir/ui/src/theme';
import {
  PrimaryNav,
  PrimaryNavItem,
  NavGroup,
  NavGroupIcons,
} from '@voussoir/ui/src/primitives/navigation';
import { A11yText, Title } from '@voussoir/ui/src/primitives/typography';
// import { FlexGroup } from '@voussoir/ui/src/primitives/layout';

import { withAdminMeta } from '../../providers/AdminMeta';
import ResizeHandler from './ResizeHandler';

const GITHUB_PROJECT = 'https://github.com/keystonejs/keystone-5';

function camelToKebab(string) {
  return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

const Inner = styled.div({
  alignItems: 'flex-start',
  display: 'flex',
  flexFlow: 'column nowrap',
  height: ' 100vh',
  justifyContent: 'flex-start',
  minWidth: 140,
  width: '100%',
});
const Page = styled.div({
  flex: 1,
  minHeight: '100vh',
  position: 'relative',
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
  position: 'absolute',
  top: 0,
  right: 0,
  width: 3,
});
const GrabHandle = styled.div({
  bottom: 0,
  cursor: 'col-resize',
  position: 'absolute',
  left: 0,
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

  // increase hit-area
  ':before': {
    bottom: -gridSize,
    content: '" "',
    left: -gridSize,
    position: 'absolute',
    right: -gridSize,
    top: -gridSize,
  },
});
const CollapseExpand = styled.button(({ isVisible }) => ({
  background: 'white',
  border: 0,
  borderRadius: '50%',
  boxShadow: '0 1px 3px 1px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.06)',
  color: colors.N60,
  cursor: 'pointer',
  display: 'flex',
  height: 24,
  opacity: isVisible ? 1 : 0,
  outline: 0,
  transition: 'opacity 200ms, transform 50ms, visibility 200ms',
  visibility: isVisible ? 'visible' : 'hidden',
  width: 24,
  top: 24,

  '> svg': { position: 'relative' },

  ':hover': {
    transform: 'scale(1.1)',
  },
  ':active': {
    transform: 'scale(1)',
  },
}));
const CollapseButton = styled(CollapseExpand)({
  right: 24,
  position: 'absolute',
  '> svg': { right: -1 },
});
const ExpandButton = styled(CollapseExpand)({
  left: 24,
  position: 'fixed',
  '> svg': { right: -3 },
});

function getPath(str) {
  const arr = str.split('/');
  return `/${arr[1]}/${arr[2]}`;
}

class Nav extends Component {
  state = { mouseIsOverNav: false };
  handleMouseEnter = () => {
    this.setState({ mouseIsOverNav: true });
  };
  handleMouseLeave = () => {
    this.setState({ mouseIsOverNav: false });
  };
  render() {
    const {
      adminMeta: { adminPath, getListByKey, graphiqlPath, listKeys, name, signoutPath, withAuth },
      children,
      location,
    } = this.props;
    const { mouseIsOverNav } = this.state;

    return (
      <ResizeHandler>
        {(resizeProps, clickProps, { isCollapsed, isDragging, width }) => {
          const navWidth = isCollapsed ? 0 : width;
          const makeResizeStyles = key => {
            const pointers = isDragging ? { pointerEvents: 'none' } : null;
            const transitions = isDragging
              ? null
              : { transition: `${camelToKebab(key)} 220ms cubic-bezier(0.25, 0, 0, 1)` };
            return { [key]: navWidth, ...pointers, ...transitions };
          };

          return (
            <PageWrapper>
              <PropToggle
                isActive={isDragging}
                styles={{ cursor: 'col-resize', 'user-select': 'none' }}
              />
              <PrimaryNav
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                style={makeResizeStyles('width')}
              >
                <Inner>
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
                          <PrimaryNavItem
                            id={`ks-nav-${list.path}`}
                            isSelected={isSelected}
                            to={href}
                          >
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
                          <PrimaryNavItem
                            target="_blank"
                            href={graphiqlPath}
                            title="Graphiql Console"
                          >
                            <TerminalIcon />
                            <A11yText>Graphiql Console</A11yText>
                          </PrimaryNavItem>
                          <PrimaryNavItem to={`${adminPath}/style-guide`} title="Style Guide">
                            <TelescopeIcon />
                            <A11yText>Style Guide</A11yText>
                          </PrimaryNavItem>
                        </Fragment>
                      ) : null}
                    </NavGroupIcons>
                  ) : null}
                </Inner>
                <Shadow />
                <CollapseButton {...clickProps} isVisible={mouseIsOverNav}>
                  <TriangleLeftIcon />
                </CollapseButton>
              </PrimaryNav>
              <Page style={makeResizeStyles('marginLeft')}>
                {isCollapsed ? (
                  <ExpandButton {...clickProps} isVisible>
                    <TriangleRightIcon />
                  </ExpandButton>
                ) : (
                  <GrabHandle {...resizeProps} />
                )}

                {children}
              </Page>
            </PageWrapper>
          );
        }}
      </ResizeHandler>
    );
  }
}

export default withRouter(withAdminMeta(Nav));
