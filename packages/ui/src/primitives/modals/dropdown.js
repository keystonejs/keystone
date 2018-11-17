// @flow
/** @jsx jsx */

import { Component, Fragment, type Node as ReactNode, type Element } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';

import { borderRadius, colors, gridSize } from '../../theme';
import FocusTrap from './FocusTrap';
import { SlideDown } from './transitions';
import { Blanket } from './common';
import withModalHandlers, { type ModalHandlerProps } from './withModalHandlers';

const ItemElement = props => {
  if (props.to) return <Link {...props} />;
  if (props.href) return <a {...props} />;
  return <button type="button" {...props} />;
};
const ItemInner = ({ children, icon }) =>
  icon ? (
    <div css={{ alignItems: 'center', display: 'flex', lineHeight: 1 }}>
      <div key="icon" css={{ marginRight: gridSize, width: 16, textAlign: 'center' }}>
        {icon}
      </div>
      <div key="children" css={{ flex: 1 }}>
        {children}
      </div>
    </div>
  ) : (
    children
  );
const Item = ({ children, icon, isDisabled, ...props }) => (
  <ItemElement
    disabled={isDisabled}
    css={{
      appearance: 'none',
      background: 'none',
      border: '1px solid transparent',
      boxSizing: 'border-box',
      color: isDisabled ? colors.N40 : colors.text,
      cursor: 'pointer',
      display: 'block',
      fontSize: 14,
      lineHeight: '17px',
      margin: 0,
      padding: `${gridSize}px ${gridSize * 1.5}px`,
      pointerEvents: isDisabled ? 'none' : null,
      textAlign: 'left',
      transition: 'box-shadow 100ms linear',
      verticalAlign: 'middle',
      whiteSpace: 'nowrap',
      width: '100%',

      '&:hover, &:focus': {
        backgroundColor: colors.B.L90,
        color: colors.primary,
        outline: 0,
        textDecoration: 'none',
      },
    }}
    {...props}
  >
    <ItemInner icon={icon}>{children}</ItemInner>
  </ItemElement>
);
const Menu = styled.div(({ left, top }) => {
  const placementStyles = { left, top };
  return {
    backgroundColor: 'white',
    borderRadius: borderRadius,
    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.175), 0 3px 8px rgba(0, 0, 0, 0.175)',
    marginTop: gridSize,
    minWidth: 160,
    paddingBottom: gridSize / 2,
    paddingTop: gridSize / 2,
    position: 'absolute',
    zIndex: 2,
    ...placementStyles,
  };
});

type ItemType = {
  content: ReactNode,
  href?: string,
  icon?: Element<*>,
  isDisabled: boolean,
  onClick?: (*) => void,
  to?: string,
};
type ClickArgs = { onClick?: ({ event: MouseEvent, data: Object }) => void };

type Props = ModalHandlerProps & {
  align: 'left' | 'right',
  getModalRef: HTMLElement => void,
  items: Array<ItemType>,
  selectClosesMenu: boolean,
  style: Object,
  targetNode: HTMLElement,
};
type State = {
  leftOffset: number,
  topOffset: number,
};

function focus(el: ?HTMLElement) {
  if (el && el instanceof HTMLElement && typeof el.focus === 'function') {
    el.focus();
  }
}

class Dropdown extends Component<Props, State> {
  menu: HTMLElement;
  lastHover: HTMLElement;
  state = { leftOffset: 0, topOffset: 0 };
  static defaultProps = {
    align: 'left',
    selectClosesMenu: true,
  };

  componentDidMount() {
    this.calculatePosition();
    document.addEventListener('keydown', this.handleKeyDown, false);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown, false);
  }

  handleItemClick = ({ onClick, ...data }: ClickArgs) => (event: MouseEvent) => {
    const { close, selectClosesMenu } = this.props;
    if (selectClosesMenu) close(event);
    if (onClick) onClick({ event, data });
  };
  handleKeyDown = (event: KeyboardEvent) => {
    const { key, target } = event;

    // appease flow
    if (!(target instanceof HTMLElement)) return;

    // bail on unused keys
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].indexOf(key) === -1) {
      return;
    }

    // kill scroll that occurs on arrow/page key press
    event.preventDefault();

    // prep shorthand key/node helpers
    const isArrowUp = key === 'ArrowUp';
    const isArrowDown = key === 'ArrowDown';
    const isPageUp = key === 'PageUp';
    const isPageDown = key === 'PageDown';

    const firstItem = ((this.menu.firstChild: any): HTMLElement);
    const lastItem = ((this.menu.lastChild: any): HTMLElement);
    const previousItem = ((target.previousSibling: any): HTMLElement);
    const nextItem = ((target.nextSibling: any): HTMLElement);

    // typical item traversal
    if (isArrowUp) focus(previousItem);
    if (isArrowDown) focus(nextItem);
    if (isPageUp) focus(firstItem);
    if (isPageDown) focus(lastItem);

    // support looping
    if (target === firstItem && isArrowUp) focus(lastItem);
    if (target === lastItem && isArrowDown) focus(firstItem);
  };
  handleMouseEnter = ({ target }: MouseEvent) => {
    if (target instanceof HTMLElement) {
      this.lastHover = target;
    }

    if (document.activeElement) {
      document.activeElement.blur();
    }
  };
  handleMenuLeave = () => {
    focus(this.lastHover);
  };
  getMenu = ref => {
    if (ref !== null) {
      this.menu = ref;
      this.props.getModalRef(ref);
    }
  };

  calculatePosition = () => {
    const { align, mode, targetNode } = this.props;

    if (!targetNode || !document.body) return;

    const bodyRect = document.body.getBoundingClientRect();
    const targetRect = targetNode.getBoundingClientRect();
    const menuHeight = this.menu.clientHeight;
    const menuWidth = this.menu.clientWidth;
    let leftOffset = 0;
    let topOffset = 0;

    // ------------------------------
    // click menu
    // ------------------------------

    if (mode === 'click') {
      leftOffset = align === 'left' ? targetRect.left : targetRect.right - menuWidth;
      topOffset = targetRect.bottom - bodyRect.top;

      this.setState({ leftOffset, topOffset });

      return;
    }

    // ------------------------------
    // context menu
    // ------------------------------

    const { clientX, clientY } = window.event;
    const clickPos = { x: clientX, y: clientY };
    const screen = { w: window.innerWidth, h: window.innerHeight };

    const right = screen.w - clickPos.x > menuWidth;
    const left = !right;
    const top = screen.h - clickPos.y > menuHeight;
    const bottom = !top;

    if (right) leftOffset = clickPos.x;
    if (left) leftOffset = clickPos.x - menuWidth;
    if (top) topOffset = clickPos.y - bodyRect.top;
    if (bottom) topOffset = clickPos.y - bodyRect.top - menuHeight;

    this.setState({ leftOffset, topOffset });
  };

  render() {
    const { items, style } = this.props;
    const { leftOffset, topOffset } = this.state;
    const attachTo = document.body;

    if (attachTo) {
      return createPortal(
        <Fragment>
          <Blanket />
          <FocusTrap options={{ clickOutsideDeactivates: true }}>
            <Menu
              left={leftOffset}
              onMouseLeave={this.handleMenuLeave}
              ref={this.getMenu}
              style={style}
              top={topOffset}
            >
              {items.map((item, idx) => {
                const { content, ...rest } = item;
                return (
                  <Item
                    {...rest}
                    onClick={this.handleItemClick(item)}
                    onMouseEnter={this.handleMouseEnter}
                    key={idx}
                  >
                    {content}
                  </Item>
                );
              })}
            </Menu>
          </FocusTrap>
        </Fragment>,
        attachTo
      );
    } else {
      return null;
    }
  }
}

export default withModalHandlers(Dropdown, { Transition: SlideDown });
