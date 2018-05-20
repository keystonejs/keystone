// @flow

import React, { PureComponent, type Element, type Node } from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';

import { borderRadius, colors, gridSize } from '../../theme';
import FocusTrap from './FocusTrap';
import { withModalGateway } from './provider';
import { SlideDown } from './transitions';
import withModalHandlers, { type CloseType } from './withModalHandlers';

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
const Menu = styled.div(({ left, top }) => ({
  backgroundColor: 'white',
  borderRadius: borderRadius,
  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.175), 0 3px 8px rgba(0, 0, 0, 0.175)',
  marginTop: gridSize,
  maxHeight: '100%',
  minWidth: 160,
  position: 'absolute',
  left,
  top,
}));
const MenuList = styled.div({
  paddingBottom: gridSize / 2,
  paddingTop: gridSize / 2,
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
  target: Element<*>,
  targetNode: HTMLElement,
  width: number,
};

function focus(el) {
  if (el && typeof el.focus === 'function') {
    el.focus();
  }
}

type State = { leftOffset: number, topOffset: number };

class Dropdown extends PureComponent<Props, State> {
  list: HTMLElement;
  lastHover: HTMLElement;
  state = { leftOffset: 0, topOffset: 0 };
  static defaultProps = {
    selectClosesMenu: true,
  };

  componentDidMount() {
    console.log('dropdown -- DidMount');
    document.addEventListener('keydown', this.handleKeyDown, false);
    this.calculatePosition();
  }
  componentWillUnmount() {
    console.log('dropdown -- WillUnmount');
    document.removeEventListener('keydown', this.handleKeyDown, false);
  }

  handleItemClick = ({ onClick, ...data }: ClickArgs) => (
    event: MouseEvent
  ) => {
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

    const firstItem = this.list.firstChild;
    const lastItem = this.list.lastChild;
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
  getList = (ref: HTMLElement) => {
    this.list = ref;
  };

  calculatePosition = () => {
    const { targetNode } = this.props;

    if (!targetNode || !document.body) return;

    // prepare common values
    const bodyRect = document.body.getBoundingClientRect();
    const targetRect = targetNode.getBoundingClientRect();

    let leftOffset = targetRect.left;
    let topOffset = targetRect.bottom - bodyRect.top;

    // avoid state thrashing
    const newStateAvaliable =
      this.state.leftOffset !== leftOffset ||
      this.state.topOffset !== topOffset;

    if (newStateAvaliable) {
      this.setState({ leftOffset, topOffset });
    }
  };

  render() {
    const { in: show, items, getModalRef, width, style } = this.props;
    let { leftOffset, topOffset } = this.state;

    return (
      <SlideDown in={show}>
        <Menu
          innerRef={getModalRef}
          left={leftOffset}
          top={topOffset}
          onMouseLeave={this.handleMenuLeave}
          style={style} // style comes from Transition
          width={width}
        >
          <FocusTrap options={{ clickOutsideDeactivates: true }}>
            <MenuList innerRef={this.getList}>
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
            </MenuList>
          </FocusTrap>
        </Menu>
      </SlideDown>
    );
  }
}

const DropdownWithGateway = withModalGateway(Dropdown, 'dropdown');
export default withModalHandlers(DropdownWithGateway);
