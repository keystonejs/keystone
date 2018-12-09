/* global ENABLE_DEV_FEATURES */
/** @jsx jsx */

import { Component, Fragment } from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import PropToggle from 'react-prop-toggle';
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';

import {
  TerminalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TelescopeIcon,
  MarkGithubIcon,
  SignOutIcon,
} from '@voussoir/icons';
import { colors, gridSize } from '@voussoir/ui/src/theme';
import {
  PrimaryNav,
  PrimaryNavItem,
  PrimaryNavScrollArea,
  NavGroupIcons,
  PRIMARY_NAV_GUTTER,
} from '@voussoir/ui/src/primitives/navigation';
import { A11yText, Title } from '@voussoir/ui/src/primitives/typography';
import { Tooltip } from '@voussoir/ui/src/primitives/modals';
import { FlexGroup } from '@voussoir/ui/src/primitives/layout';

import { withAdminMeta } from '../../providers/AdminMeta';
import ResizeHandler, { KEYBOARD_SHORTCUT } from './ResizeHandler';
import ScrollQuery from '../ScrollQuery';

const GITHUB_PROJECT = 'https://github.com/keystonejs/keystone-5';
const TRANSITION_DURATION = '220ms';

function camelToKebab(string) {
  return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

const Col = styled.div({
  alignItems: 'flex-start',
  display: 'flex',
  flex: 1,
  flexFlow: 'column nowrap',
  justifyContent: 'flex-start',
  overflow: 'hidden',
  width: '100%',
});
const Inner = styled(Col)({
  height: ' 100vh',
});
const Page = styled.div({
  flex: 1,
  minHeight: '100vh',
  position: 'relative',
});
const PageWrapper = styled.div({
  display: 'flex',
});
const Relative = styled(Col)({
  height: ' 100%',
  position: 'relative',
});
const GrabHandle = styled.div({
  background: `linear-gradient(to left, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0))`, // drop-shadow
  bottom: 0,
  cursor: 'col-resize',
  position: 'absolute',
  right: 0,
  top: 0,
  opacity: 0.6,
  transition: 'opacity 220ms linear',
  width: 3,

  ':hover, :active': {
    opacity: 1,
    transitionDelay: '100ms', // avoid inadvertent mouse passes
  },

  // hairline
  ':after': {
    background: `rgba(0, 0, 0, 0.125)`,
    bottom: 0,
    content: '" "',
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    right: 0,
    width: 1,
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
  };
});

const TooltipContent = ({ kbd, children }) => (
  <FlexGroup align="center" growIndexes={[0]}>
    <span key="children">{children}</span>
    <kbd
      key="kbd"
      css={{
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        display: 'inline-block',
        fontWeight: 'bold',
        height: 14,
        lineHeight: 1,
        paddingBottom: 1,
        paddingLeft: 4,
        paddingRight: 4,
      }}
    >
      {kbd}
    </kbd>
  </FlexGroup>
);

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
      adminMeta: {
        adminPath,
        getListByKey,
        graphiqlPath,
        name,
        sortListsAlphabetically,
        signoutPath,
        withAuth,
      },
      children,
      location,
    } = this.props;
    const listKeys = sortListsAlphabetically
      ? this.props.adminMeta.listKeys.sort()
      : this.props.adminMeta.listKeys;
    const { mouseIsOverNav } = this.state;

    return (
      <ResizeHandler>
        {(resizeProps, clickProps, { isCollapsed, isDragging, width }) => {
          const navWidth = isCollapsed ? 0 : width;
          const makeResizeStyles = key => {
            const pointers = isDragging ? { pointerEvents: 'none' } : null;
            const transitions = isDragging
              ? null
              : {
                  transition: `${camelToKebab(
                    key
                  )} ${TRANSITION_DURATION} cubic-bezier(0.25, 0, 0, 1)`,
                };
            return { [key]: navWidth, ...pointers, ...transitions };
          };

          const titleGutter = {
            color: colors.N90,
            textDecoration: 'none',
            alignSelf: 'stretch',
            marginLeft: PRIMARY_NAV_GUTTER,
            marginRight: PRIMARY_NAV_GUTTER,
          };

          return (
            <PageWrapper>
              <PropToggle
                isActive={isDragging}
                styles={{
                  cursor: 'col-resize',
                  '-moz-user-select': 'none',
                  '-ms-user-select': 'none',
                  '-webkit-user-select': 'none',
                  'user-select': 'none',
                }}
              />
              <PrimaryNav
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                style={makeResizeStyles('width')}
              >
                <Inner>
                  <Title as={Link} to={adminPath} margin="both" crop style={titleGutter}>
                    {name}
                  </Title>
                  <Relative>
                    <ScrollQuery isPassive={false}>
                      {(ref, snapshot) => (
                        <PrimaryNavScrollArea ref={ref} {...snapshot}>
                          <PrimaryNavItem
                            to={adminPath}
                            isSelected={location.pathname == adminPath}
                          >
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
                        </PrimaryNavScrollArea>
                      )}
                    </ScrollQuery>
                  </Relative>

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
                {isCollapsed ? null : <GrabHandle {...resizeProps} />}
                <Tooltip
                  content={
                    <TooltipContent kbd={KEYBOARD_SHORTCUT}>
                      {isCollapsed ? 'Click to Expand' : 'Click to Collapse'}
                    </TooltipContent>
                  }
                  placement="right"
                  hideOnMouseDown
                  hideOnKeyDown
                  delay={600}
                >
                  {ref => (
                    <CollapseExpand
                      {...clickProps}
                      ref={ref}
                      isCollapsed={isCollapsed}
                      isVisible={isCollapsed || mouseIsOverNav}
                    >
                      {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </CollapseExpand>
                  )}
                </Tooltip>
              </PrimaryNav>
              <Page style={makeResizeStyles('marginLeft')}>{children}</Page>
            </PageWrapper>
          );
        }}
      </ResizeHandler>
    );
  }
}

export default withRouter(withAdminMeta(Nav));
