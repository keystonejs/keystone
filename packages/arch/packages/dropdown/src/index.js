/** @jsx jsx */

import { useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';
import { usePopper } from 'react-popper';

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

const Menu = styled.div({
  backgroundColor: 'white',
  borderRadius: borderRadius,
  boxShadow: shadows[2],
  marginTop: gridSize,
  minWidth: 160,
  paddingBottom: gridSize / 2,
  paddingTop: gridSize / 2,
});

function focus(el) {
  if (el && el instanceof HTMLElement && typeof el.focus === 'function') {
    el.focus();
  }
}

const Dropdown = ({
  align = 'left',
  close,
  contentNode,
  getModalRef,
  items,
  mode,
  mouseCoords,
  selectClosesMenu = true,
  style,
  targetNode,
}) => {
  const lastHover = useRef();

  useEffect(() => {
    const handleKeyDown = event => {
      const { key, target } = event;

      // appease flow
      if (!(target instanceof HTMLElement)) return;

      // bail on unused keys
      if (!['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].includes(key)) {
        return;
      }

      // kill scroll that occurs on arrow/page key press
      event.preventDefault();

      const firstItem = target.parentNode.firstChild;
      const lastItem = target.parentNode.lastChild;
      const previousItem = target.previousSibling;
      const nextItem = target.nextSibling;

      // handle item traversal and looping
      switch (key) {
        case 'ArrowUp':
          focus(target === firstItem ? lastItem : previousItem);
          break;
        case 'ArrowDown':
          focus(target === lastItem ? firstItem : nextItem);
          break;
        case 'PageUp':
          focus(firstItem);
          break;
        case 'PageDown':
          focus(lastItem);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown, false);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, false);
    };
  }, []);

  const handleItemClick = ({ onClick, ...data }) => event => {
    if (selectClosesMenu) close(event);
    if (onClick) onClick({ event, data });
  };

  const handleMouseEnter = ({ target }) => {
    if (target instanceof HTMLElement) {
      lastHover.current = target;
    }

    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  const handleMenuLeave = () => {
    focus(lastHover.current);
  };

  // Memoized to prevent infinite looping on the contextmenu case. No idea why it happens...
  const popperTarget = useMemo(() => {
    switch (mode) {
      case 'click':
        return targetNode;
      case 'contextmenu': {
        // TODO: make sure this is the desired behavior for a context menu (currently no usecases)
        const { clientX, clientY } = mouseCoords;
        return { getBoundingClientRect: () => ({ left: clientX, top: clientY }) };
      }
    }
  }, [mode, mouseCoords]);

  const { styles } = usePopper(popperTarget, contentNode, {
    placement: `${['left', 'right'].includes(align) ? align : 'left'}-start`,
  });

  const attachTo = document.body;
  if (!attachTo) {
    return null;
  }

  return createPortal(
    <div style={{ ...styles.popper, zIndex: 2 }} ref={getModalRef}>
      <FocusTrap focusTrapOptions={{ clickOutsideDeactivates: true }}>
        <Menu style={style} onMouseLeave={handleMenuLeave}>
          {items.map((item, idx) => {
            const { content, ...rest } = item;
            return (
              <Item
                {...rest}
                onClick={handleItemClick(item)}
                onMouseEnter={handleMouseEnter}
                key={idx}
              >
                {content}
              </Item>
            );
          })}
        </Menu>
      </FocusTrap>
    </div>,
    attachTo
  );
};

export default withModalHandlers(Dropdown, { transition: slideDown });
