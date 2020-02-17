/** @jsx jsx */

import { Component } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';

import { borderRadius, colors, gridSize, shadows } from '@arch-ui/theme';
import FocusTrap from 'focus-trap-react';
import { withModalHandlers, slideDown } from '@arch-ui/modal-utils';

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
    boxShadow: shadows[2],
    marginTop: gridSize,
    minWidth: 160,
    paddingBottom: gridSize / 2,
    paddingTop: gridSize / 2,
    position: 'absolute',
    zIndex: 2,
    ...placementStyles,
  };
});

function focus(el) {
  if (el && el instanceof HTMLElement && typeof el.focus === 'function') {
    el.focus();
  }
}

class Dropdown extends Component {
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

  handleItemClick = ({ onClick, ...data }) => event => {
    const { close, selectClosesMenu } = this.props;
    if (selectClosesMenu) close(event);
    if (onClick) onClick({ event, data });
  };
  handleKeyDown = event => {
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

    const firstItem = this.menu.firstChild;
    const lastItem = this.menu.lastChild;
    const previousItem = target.previousSibling;
    const nextItem = target.nextSibling;

    // typical item traversal
    if (isArrowUp) focus(previousItem);
    if (isArrowDown) focus(nextItem);
    if (isPageUp) focus(firstItem);
    if (isPageDown) focus(lastItem);

    // support looping
    if (target === firstItem && isArrowUp) focus(lastItem);
    if (target === lastItem && isArrowDown) focus(firstItem);
  };
  handleMouseEnter = ({ target }) => {
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
    const { align, mode, mouseCoords, targetNode } = this.props;

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

    const { clientX, clientY } = mouseCoords;
    const screen = { w: window.innerWidth, h: window.innerHeight };

    const right = screen.w - clientX > menuWidth;
    const left = !right;
    const top = screen.h - clientY > menuHeight;
    const bottom = !top;

    if (right) leftOffset = clientX;
    if (left) leftOffset = clientX - menuWidth;
    if (top) topOffset = clientY - bodyRect.top;
    if (bottom) topOffset = clientY - bodyRect.top - menuHeight;

    this.setState({ leftOffset, topOffset });
  };

  render() {
    const { items, style } = this.props;
    const { leftOffset, topOffset } = this.state;
    const attachTo = document.body;

    if (attachTo) {
      return createPortal(
        <FocusTrap focusTrapOptions={{ clickOutsideDeactivates: true }}>
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
        </FocusTrap>,
        attachTo
      );
    } else {
      return null;
    }
  }
}

export default withModalHandlers(Dropdown, { transition: slideDown });
