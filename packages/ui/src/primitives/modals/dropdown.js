// @flow

import React, { Component, Fragment, type Element, type Node } from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';
import NodeResolver from 'react-node-resolver';

import { borderRadius, colors, gridSize } from '../../theme';

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
  position: 'absolute',
});

type ItemType = {
  to?: string,
  content: Node,
  href?: string,
  onClick?: (*) => void,
};
type ClickArgs = { onClick?: MouseEvent => void };
type Props = {
  children: Element<*>,
  defaultIsOpen: boolean,
  items: Array<ItemType>,
  selectClosesMenu: boolean,
};
type State = { isOpen: boolean };

function focus(el) {
  if (el && typeof el.focus === 'function') {
    el.focus();
  }
}

export default class Dropdown extends Component<Props, State> {
  lastHover: HTMLElement;
  menu: HTMLElement;
  target: HTMLElement;
  state = { isOpen: this.props.defaultIsOpen };
  static defaultProps = {
    selectClosesMenu: true,
  };

  componentDidMount() {
    document.addEventListener('click', this.handleClick);
    document.addEventListener('keydown', this.handleKeyDown, false);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('keydown', this.handleKeyDown, false);
  }

  open = () => {
    this.setState({ isOpen: true });
    focus(this.menu.firstChild);
  };
  close = ({ returnFocus }: { returnFocus: boolean }) => {
    this.setState({ isOpen: false });
    if (returnFocus) this.target.focus();
  };

  handleClick = ({ target }: MouseEvent) => {
    const { isOpen } = this.state;

    // appease flow
    if (!(target instanceof HTMLElement)) return;

    // close on outside click
    if (isOpen && !this.menu.contains(target)) {
      this.close({ returnFocus: false });
    }

    // open on target click
    if (!isOpen && this.target.contains(target)) {
      this.open();
    }
  };
  handleItemClick = ({ onClick }: ClickArgs) => (event: MouseEvent) => {
    const { selectClosesMenu } = this.props;
    if (selectClosesMenu) this.close({ returnFocus: true });
    if (onClick) onClick(event);
  };
  handleKeyDown = (event: KeyboardEvent) => {
    const { key, target } = event;
    const { isOpen } = this.state;

    if (!isOpen || !(target instanceof HTMLElement)) return;

    if (key === 'Escape') {
      this.close({ returnFocus: true });
      return;
    }

    const isArrowUp = key === 'ArrowUp';
    const isArrowDown = key === 'ArrowDown';
    const isPageUp = key === 'PageUp';
    const isPageDown = key === 'PageDown';

    const firstItem = this.menu.firstChild;
    const lastItem = this.menu.lastChild;
    const preventScroll = isArrowUp || isArrowDown || isPageUp || isPageDown;

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

  getTarget = (ref: HTMLElement) => {
    this.target = ref;
  };
  getMenu = (ref: HTMLElement) => {
    this.menu = ref;
  };

  render() {
    const { children, items } = this.props;
    const { isOpen } = this.state;

    return (
      <Fragment>
        <NodeResolver innerRef={this.getTarget}>{children}</NodeResolver>
        {isOpen ? (
          <Menu innerRef={this.getMenu} onMouseLeave={this.handleMenuLeave}>
            {items.map(({ content, ...rest }, idx) => (
              <Item
                {...rest}
                onClick={this.handleItemClick(rest)}
                onMouseOver={this.handleMouseOver}
                key={idx}
              >
                {content}
              </Item>
            ))}
          </Menu>
        ) : null}
      </Fragment>
    );
  }
}
