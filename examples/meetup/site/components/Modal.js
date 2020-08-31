/** @jsx jsx */

import { createPortal } from 'react-dom';
import { jsx } from '@emotion/core';

import { useKeydown, useLogoDimension } from '../helpers';
import { mq } from '../helpers/media';
import { XIcon } from '../primitives';
import { HEADER_GUTTER } from './Navbar';
import { colors, fontSizes } from '../theme';

// ==============================
// Exports
// ==============================

export const Modal = props => {
  if (!canUseDOM) return null;

  // the modal element component is separated so the keydown handler attaches
  // and detaches during mount and unmount respectively.
  return props.isOpen ? createPortal(<ModalElement {...props} />, document.body) : null;
};

const ModalElement = props => {
  const { children, onClose, title } = props;

  useKeydown('Escape', onClose);

  return (
    <>
      <Blanket onClick={onClose} />
      <Dialog ariaLabel={title}>
        <Close onClick={onClose} />
        <Title>{title}</Title>
        {children}
      </Dialog>
    </>
  );
};

// ==============================
// Helpers
// ==============================

const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

// ==============================
// Styled Components
// ==============================

const Dialog = ({ ariaLabel, ...props }) => {
  const { logoHeight, logoHeightSm } = useLogoDimension();
  const offsetTop = [logoHeightSm, logoHeight];
  const offsetRight = HEADER_GUTTER;

  return (
    <div
      aria-label={ariaLabel}
      role="dialog"
      tabIndex="-1"
      css={mq({
        boxShadow:
          'rgba(9, 30, 66, 0.08) 0px 0px 0px 1px, rgba(9, 30, 66, 0.08) 0px 2px 1px, rgba(9, 30, 66, 0.31) 0px 0px 20px -6px',
        boxSizing: 'border-box',
        right: offsetRight,
        top: offsetTop,
        background: 'white',
        borderRadius: 4,
        maxWidth: '92vw',
        padding: 24,
        position: 'absolute',
        zIndex: 20,
        width: 420,
      })}
      {...props}
    />
  );
};
const Blanket = ({ ariaLabel, ...props }) => (
  <div
    css={{
      bottom: 0,
      left: 0,
      position: 'fixed',
      right: 0,
      top: 0,
      zIndex: 10,
    }}
    {...props}
  />
);
const Close = props => (
  <button
    css={{
      background: 0,
      border: 0,
      borderRadius: 2,
      color: colors.greyMedium,
      cursor: 'pointer',
      float: 'right',
      height: 32,
      lineHeight: 0,
      padding: 0,
      transition: 'background-color 150ms, color 150ms',
      verticalAlign: 'top',
      width: 32,

      ':hover, :focus': {
        background: colors.greyLight,
        color: colors.greyDark,
        outline: 0,
      },
    }}
    {...props}
  >
    <XIcon />
  </button>
);
const Title = props => (
  <h2
    css={{
      fontSize: fontSizes.md,
      margin: 0,
    }}
    {...props}
  />
);
