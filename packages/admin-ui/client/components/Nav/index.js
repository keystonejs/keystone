/** @jsx jsx */

import { Fragment, Component, memo } from 'react';
import PropToggle from 'react-prop-toggle';
import { uid } from 'react-uid';
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';

import { ChevronLeftIcon, ChevronRightIcon } from '@arch-ui/icons';
import { colors, gridSize } from '@arch-ui/theme';
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

import { Link, withRouter, routes } from '../../providers/Router';
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
  backgroundColor: 'rgba(9, 30, 66, 0.2)',
  bottom: 0,
  cursor: 'col-resize',
  opacity: 0.5,
  position: 'absolute',
  right: 0,
  top: 0,
  transition: 'opacity 220ms linear',
  width: 1,

  ':hover, :active': {
    opacity: 1,
    transitionDelay: '100ms', // avoid inadvertent mouse passes
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

function renderChildren(node, getListByKey, depth, router) {
  if (node.children) {
    const groupKey = uid(node.children);
    depth += 1;

    return (
      <Fragment key={groupKey}>
        {node.label && <PrimaryNavHeading depth={depth}>{node.label}</PrimaryNavHeading>}
        {node.children.map(child => renderChildren(child, getListByKey, depth, router))}
      </Fragment>
    );
  }

  const key = typeof node === 'string' ? node : node.listKey;
  const list = getListByKey(key);

  if (!list) {
    throw new Error(`Unable to resolve list for key ${key}`);
  }

  const label = node.label || list.label;
  const href = routes.list.to({ listPath: list.path }).as;
  const path = router.asPath.split('?')[0].split('#')[0];
  const isSelected = href === path;
  const id = `ks-nav-${list.path}`;

  const maybeSearchParam = list.getPersistedSearch();

  return (
    <Link
      passHref
      route="list"
      params={{ ...maybeSearchParam, listPath: list.path }}
      key={key}
    >
      <PrimaryNavItem
        depth={depth}
        id={id}
        isSelected={isSelected}
        as="a"
      >
        {label}
      </PrimaryNavItem>
    </Link>
  );
}

const PrimaryNavItems = withRouter(({ adminPath, getListByKey, pages, listKeys, router }) => {
  return (
    <Relative>
      <ScrollQuery isPassive={false}>
        {(ref, snapshot) => (
          <PrimaryNavScrollArea ref={ref} {...snapshot}>
            <Link passHref route="index">
              <PrimaryNavItem as="a" isSelected={router.pathname === '/'}>
                Dashboard
              </PrimaryNavItem>
            </Link>
            {pages && pages.length
              ? pages.map(node => renderChildren(node, getListByKey, 0, router))
              : listKeys.map(key => renderChildren(key, getListByKey, 0, router))
            }
          </PrimaryNavScrollArea>
        )}
      </ScrollQuery>
    </Relative>
  );
});

let PrimaryNavContent = memo(
  function PrimaryContent() {
    let { getListByKey, listKeys, name, pages } = useAdminMeta();

    return (
      <Inner>
        <Link passHref route="index">
          <Title
            as="a"
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
        </Link>
        <PrimaryNavItems
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

export default Nav;
