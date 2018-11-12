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
import ScrollQuery from '../ScrollQuery';

const GITHUB_PROJECT = 'https://github.com/keystonejs/keystone-5';
const TRANSITION_DURATION = '220ms';

function camelToKebab(string) {
  return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

const Inner = styled.div({
  alignItems: 'flex-start',
  display: 'flex',
  flexFlow: 'column nowrap',
  height: ' 100vh',
  justifyContent: 'flex-start',
  overflow:'hidden',
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
  right: -1,
  top: 0,
  transition: 'background-color 200ms',
  width: 1,

  ':hover, :active': {
    backgroundColor: colors.N30,
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
const CollapseExpand = styled.button(({ isCollapsed, isVisible }) => {
  const SIZE = isCollapsed ? 48 : 24;
  const GUTTER = isCollapsed ? 12 : 24;
  const boxShadow = isCollapsed
    ? '0 2px 4px 1px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1)'
    : '0 1px 3px 1px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.06)';

  return {
    alignItems: 'center',
    background: 'white',
    border: 0,
    borderRadius: '50%',
    boxShadow,
    color: colors.N60,
    cursor: 'pointer',
    display: 'flex',
    height: SIZE,
    justifyContent: 'center',
    right: -SIZE / 2,
    opacity: isVisible ? 1 : 0,
    outline: 0,
    padding: 0,
    position: 'absolute',
    transition: `
      opacity ${TRANSITION_DURATION},
      right ${TRANSITION_DURATION},
      transform 50ms,
      visibility ${TRANSITION_DURATION}
    `,
    visibility: isVisible ? 'visible' : 'hidden',
    width: SIZE,
    top: GUTTER,

    '> svg': {
      position: 'relative',
      right: isCollapsed ? -9 : 1,
      transition: `right ${TRANSITION_DURATION}`,
    },

    ':hover': {
      transform: 'scale(1.12)',
    },
    ':active': {
      transform: 'scale(1)',
    },
  }
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
              : { transition: `${camelToKebab(key)} ${TRANSITION_DURATION} cubic-bezier(0.25, 0, 0, 1)` };
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
                  <ScrollQuery>
                    {(ref, snapshot) => (
                      <NavGroup ref={ref} isScrollable={snapshot.isScrollable}>
                        <Title as="div" margin="both" crop>
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
                    )}
                  </ScrollQuery>

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
                {isCollapsed ? null : <GrabHandle {...resizeProps} />}
                <CollapseExpand {...clickProps} isCollapsed={isCollapsed} isVisible={isCollapsed || mouseIsOverNav}>
                  {isCollapsed ? <TriangleRightIcon /> : <TriangleLeftIcon />}
                </CollapseExpand>
              </PrimaryNav>
              <Page style={makeResizeStyles('marginLeft')}>
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
