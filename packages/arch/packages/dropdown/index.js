// @flow

import React, { Component, type Element, type Node } from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import FocusTrap from 'react-focus-marshal';

import { borderRadius, colors, gridSize } from '../theme';
import { SlideDown, withModalHandlers, type CloseType } from '../modal-utils';

const ItemElement = props => {
  if (props.to) return <Link {...props} />;
  if (props.href) return <a {...props} />;
  return <button type="button" {...props} />;
};

const Item = styled(ItemElement)({
  appearance: 'none',
  background: 'none',
  border: '1px solid transparent',
  color: colors.text,
  cursor: 'pointer',
  display: 'block',
  fontSize: 14,
  lineHeight: '17px',
  margin: 0,
  padding: `${gridSize}px ${gridSize * 1.5}px`,
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
});
const Menu = styled.div({
  backgroundColor: 'white',
  borderRadius: borderRadius,
  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.175), 0 3px 8px rgba(0, 0, 0, 0.175)',
  marginTop: gridSize,
  maxHeight: '100%',
  minWidth: 160,
  paddingBottom: gridSize / 2,
  paddingTop: gridSize / 2,
  position: 'absolute',
});

type ItemType = {
  to?: string,
  content: Node,
  href?: string,
  onClick?: (*) => void,
};
type ClickArgs = { onClick?: ({ event: MouseEvent, data: Object }) => void };
type Props = {
  children: Element<*>,
  close: CloseType,
  defaultIsOpen: boolean,
  getModalRef: HTMLElement => void,
  items: Array<ItemType>,
  selectClosesMenu: boolean,
  style: Object,
};

function focus(el) {
  if (el && typeof el.focus === 'function') {
    el.focus();
  }
}

class Dropdown extends Component<Props> {
  menu: HTMLElement;
  lastHover: HTMLElement;
  static defaultProps = {
    selectClosesMenu: true,
  };

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown, false);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown, false);
  }

  handleItemClick = ({ onClick, ...data }: ClickArgs) => (event: MouseEvent) => {
    const { close, selectClosesMenu } = this.props;
    if (selectClosesMenu) close({ returnFocus: true });
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

    // prep shorthand key/node helpers
    const isArrowUp = key === 'ArrowUp';
    const isArrowDown = key === 'ArrowDown';
    const isPageUp = key === 'PageUp';
    const isPageDown = key === 'PageDown';

    const firstItem = this.menu.firstChild;
    const lastItem = this.menu.lastChild;
    const preventScroll = isArrowUp || isArrowDown || isPageUp || isPageDown;

    // kill scroll that occurs on arrow/page key press
    if (preventScroll) event.preventDefault();

    // typical item traversal
    if (isArrowUp) focus(target.previousSibling);
    if (isArrowDown) focus(target.nextSibling);
    if (isPageUp) focus(firstItem);
    if (isPageDown) focus(lastItem);

    // support looping
    if (target === firstItem && isArrowUp) focus(lastItem);
    if (target === lastItem && isArrowDown) focus(firstItem);
  };
  handleMouseOver = ({ target }: MouseEvent) => {
    if (target instanceof HTMLElement) {
      this.lastHover = target;
    }

    if (document.activeElement) {
      document.activeElement.blur();
    }
  };
  handleMenuLeave = () => {
    this.lastHover.focus();
  };
  getMenu = (ref: HTMLElement) => {
    this.menu = ref;
    this.props.getModalRef(ref);
  };

  render() {
    const { items, style } = this.props;

    return (
      <FocusTrap options={{ clickOutsideDeactivates: true }}>
        <Menu ref={this.getMenu} onMouseLeave={this.handleMenuLeave} style={style}>
          {items.map((item, idx) => {
            const { content, ...rest } = item;
            return (
              <Item
                {...rest}
                onClick={this.handleItemClick(item)}
                onMouseOver={this.handleMouseOver}
                key={idx}
              >
                {content}
              </Item>
            );
          })}
        </Menu>
      </FocusTrap>
    );
  }
}

export default withModalHandlers(Dropdown, { Transition: SlideDown });
