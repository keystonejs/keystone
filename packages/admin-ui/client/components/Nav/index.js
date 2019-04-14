/** @jsx jsx */

import React, { Component, memo } from 'react'; // eslint-disable-line no-unused-vars
import { withRouter, Route, Link } from 'react-router-dom';
import PropToggle from 'react-prop-toggle';
import { uid } from 'react-uid';
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';

import { colors, gridSize } from '@arch-ui/theme';
import { alpha } from '@arch-ui/color-utils';
import {
  PrimaryNav,
  PrimaryNavItem,
  PrimaryNavHeading,
  PrimaryNavScrollArea,
  PRIMARY_NAV_GUTTER,
} from '@arch-ui/navbar';
import { Title } from '@arch-ui/typography';
import Tooltip from '@arch-ui/tooltip';
import { FlexGroup } from '@arch-ui/layout';

import { useAdminMeta } from '../../providers/AdminMeta';
import ResizeHandler, { KEYBOARD_SHORTCUT } from './ResizeHandler';
import { NavIcons } from './NavIcons';
import ScrollQuery from '../ScrollQuery';

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
  backgroundColor: alpha(colors.text, 0.05),
  bottom: 0,
  cursor: 'col-resize',
  position: 'absolute',
  right: 0,
  top: 0,
  transition: 'background-color 220ms linear',
  width: 1,

  ':hover': {
    transitionDelay: '100ms', // avoid inadvertent mouse passes
    backgroundColor: alpha(colors.text, 0.1),
  },
  ':active': {
    backgroundColor: alpha(colors.text, 0.15),
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
const CollapseExpand = styled.button(({ isCollapsed }) => {
  const size = 32;
  const offsetTop = 18;

  return {
    alignItems: 'center',
    background: 0,
    border: 0,
    borderRadius: '50%',
    // boxShadow,
    color: isCollapsed ? colors.N80 : colors.N20,
    cursor: 'pointer',
    display: 'flex',
    height: size,
    justifyContent: 'center',
    right: -size,
    outline: 0,
    padding: 0,
    position: 'absolute',
    transition: `color ${TRANSITION_DURATION}`,
    width: size,
    top: offsetTop,

    ':hover': {
      color: colors.primary,
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

function renderChildren(node, getListByKey, adminPath, depth) {
  if (node.children) {
    const groupKey = uid(node.children);
    depth += 1;

    return (
      <React.Fragment key={groupKey}>
        {node.label && <PrimaryNavHeading depth={depth}>{node.label}</PrimaryNavHeading>}
        {node.children.map(child => renderChildren(child, getListByKey, adminPath, depth))}
      </React.Fragment>
    );
  }

  const key = typeof node === 'string' ? node : node.listKey;
  const list = getListByKey(key);

  if (!list) {
    throw new Error(`Unable to resolve list for key ${key}`);
  }

  const label = node.label || list.label;
  const maybeSearchParam = list.getPersistedSearch() || '';
  const path = getPath(location.pathname);
  const href = `${adminPath}/${list.path}`;
  const isSelected = href === path;
  const id = `ks-nav-${list.path}`;

  return (
    <PrimaryNavItem
      key={key}
      depth={depth}
      id={id}
      isSelected={isSelected}
      to={`${href}${maybeSearchParam}`}
    >
      {label}
    </PrimaryNavItem>
  );
}

function PrimaryNavItems({ adminPath, getListByKey, pages, listKeys }) {
  return (
    <Relative>
      <Route>
        {({ location }) => (
          <ScrollQuery isPassive={false}>
            {(ref, snapshot) => (
              <PrimaryNavScrollArea ref={ref} {...snapshot}>
                <PrimaryNavItem to={adminPath} isSelected={location.pathname === adminPath}>
                  Dashboard
                </PrimaryNavItem>

                {pages && pages.length
                  ? pages.map(node => renderChildren(node, getListByKey, adminPath, 0))
                  : listKeys.map(key => renderChildren(key, getListByKey, adminPath))}
              </PrimaryNavScrollArea>
            )}
          </ScrollQuery>
        )}
      </Route>
    </Relative>
  );
}

let PrimaryNavContent = memo(
  function PrimaryContent() {
    let { adminPath, getListByKey, listKeys, name, pages } = useAdminMeta();

    return (
      <Inner>
        <Title
          as={Link}
          to={adminPath}
          margin="both"
          crop
          css={{
            color: colors.N90,
            textDecoration: 'none',
            alignSelf: 'stretch',
            marginLeft: PRIMARY_NAV_GUTTER,
            marginRight: PRIMARY_NAV_GUTTER,
          }}
        >
          {name}
        </Title>
        <PrimaryNavItems
          adminPath={adminPath}
          getListByKey={getListByKey}
          listKeys={listKeys.sort()}
          pages={pages}
        />
        <NavIcons />
      </Inner>
    );
  },
  () => true
);

class Nav extends Component {
  state = { mouseIsOverNav: false };

  handleMouseEnter = () => {
    this.setState({ mouseIsOverNav: true });
  };
  handleMouseLeave = () => {
    this.setState({ mouseIsOverNav: false });
  };
  render() {
    const { children } = this.props;
    const { mouseIsOverNav } = this.state;

    return (
      <ResizeHandler isActive={mouseIsOverNav}>
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
                <PrimaryNavContent />
                {isCollapsed ? null : <GrabHandle isActive={mouseIsOverNav} {...resizeProps} />}
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
                    <CollapseExpand isCollapsed={isCollapsed} {...clickProps} ref={ref}>
                      <svg
                        fill="currentColor"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M2 12h11a1 1 0 0 1 0 2H2a1 1 0 0 1 0-2zm0-5h9a1 1 0 0 1 0 2H2a1 1 0 1 1 0-2zm0-5h12a1 1 0 0 1 0 2H2a1 1 0 1 1 0-2z" />
                      </svg>
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

export default withRouter(Nav);
