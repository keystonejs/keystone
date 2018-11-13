// @flow

import React, { Component, type Node as ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';

import { borderRadius, colors, gridSize } from '../../theme';
import FocusTrap from './FocusTrap';
import { SlideDown } from './transitions';
import withModalHandlers, { type ModalHandlerProps } from './withModalHandlers';

const ItemElement = props => {
  if (props.to) return <Link {...props} />;
  if (props.href) return <a {...props} />;
  return <button type="button" {...props} />;
};

const Item = styled(ItemElement)(({ isDisabled }) => ({
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
}));
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
    ...placementStyles,
  };
});

type ItemType = {
  to?: string,
  content: ReactNode,
  href?: string,
  onClick?: (*) => void,
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

function focus(el: ?Node) {
  if (el instanceof HTMLElement) el.focus();
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

    const firstItem = this.menu.firstChild;
    const lastItem = this.menu.lastChild;

    // typical item traversal
    if (isArrowUp) focus(target.previousSibling);
    if (isArrowDown) focus(target.nextSibling);
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
    this.lastHover.focus();
  };
  getMenu = ref => {
    if (ref !== null) {
      this.menu = ref;
      this.props.getModalRef(ref);
    }
  };

  calculatePosition = () => {
    const { align, targetNode } = this.props;

    if (!targetNode || !document.body) return;

    const bodyRect = document.body.getBoundingClientRect();
    const targetRect = targetNode.getBoundingClientRect();
    const menuWidth = this.menu.clientWidth;

    const leftOffset = align === 'left' ? targetRect.left : targetRect.right - menuWidth;
    const topOffset = targetRect.bottom - bodyRect.top;

    this.setState({ leftOffset, topOffset });
  };

  render() {
    const { items, style } = this.props;
    const { leftOffset, topOffset } = this.state;
    const attachTo =  document.body;

    if (attachTo) {
      return createPortal(
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
        </FocusTrap>,
        attachTo
      );
    } else {
      return null;
    }
  }
}

export default withModalHandlers(Dropdown, { Transition: SlideDown });
