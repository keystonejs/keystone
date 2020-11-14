/** @jsx jsx */

import { Fragment, KeyboardEvent, MutableRefObject, ReactNode, useCallback, useRef } from 'react';
import FocusLock from 'react-focus-lock';
import { RemoveScroll } from 'react-remove-scroll';
import { makeId, useId, useTheme, Portal, jsx } from '@keystone-ui/core';
import { Blanket } from './Blanket';

import { useDrawerManager } from './drawer-context';
import { TransitionState } from './types';
import { DrawerControllerContextProvider } from './DrawerController';

export const DRAWER_WIDTHS = {
  narrow: 580,
  wide: 740,
};
export type WidthType = keyof typeof DRAWER_WIDTHS;
const easing = 'cubic-bezier(0.2, 0, 0, 1)';

export type DrawerBaseProps = {
  children: ReactNode;
  initialFocusRef?: MutableRefObject<any>;
  onClose: () => void;
  transitionState: TransitionState;
  onSubmit?: () => void;
  width?: WidthType;
};

const blanketTransition = {
  entering: { opacity: 0 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
};

export const DrawerBase = ({
  children,
  initialFocusRef,
  onClose,
  onSubmit,
  width = 'narrow',
  transitionState,
  ...props
}: DrawerBaseProps) => {
  const theme = useTheme();
  const containerRef = useRef(null);

  const id = useId();
  const uniqueKey = makeId('drawer', id);

  // sync drawer state
  let drawerDepth = useDrawerManager(uniqueKey);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !event.defaultPrevented) {
      event.preventDefault();
      onClose();
    }
  };

  const activateFocusLock = useCallback(() => {
    if (initialFocusRef && initialFocusRef.current) {
      initialFocusRef.current.focus();
    }
  }, [initialFocusRef]);

  const dialogTransition = getDialogTransition(drawerDepth);

  let Tag: 'div' | 'form' = 'div';
  if (onSubmit) {
    Tag = 'form';
    let oldOnSubmit = onSubmit;
    // @ts-ignore
    onSubmit = (event: any) => {
      if (!event.defaultPrevented) {
        event.preventDefault();
        oldOnSubmit();
      }
    };
  }

  return (
    <Portal>
      <Fragment>
        <Blanket
          onClick={onClose}
          style={{
            transition: `opacity 150ms linear`,
            ...blanketTransition[transitionState],
            zIndex: theme.elevation.e400,
          }}
        />
        <FocusLock autoFocus returnFocus onActivation={activateFocusLock}>
          <RemoveScroll enabled>
            <Tag
              onSubmit={onSubmit}
              aria-modal="true"
              role="dialog"
              ref={containerRef}
              tabIndex={-1}
              onKeyDown={onKeyDown}
              style={dialogTransition[transitionState]}
              css={{
                backgroundColor: theme.colors.background,
                bottom: 0,
                boxShadow: theme.shadow.s400,
                outline: 0,
                position: 'fixed',
                right: 0,
                top: 0,
                transition: `transform 150ms ${easing}`,
                width: DRAWER_WIDTHS[width],
                zIndex: theme.elevation.e400,

                // flex layout must be applied here so content will grow/shrink properly
                display: 'flex',
                flexDirection: 'column',
              }}
              {...props}
            >
              <DrawerControllerContextProvider value={null}>
                {children}
              </DrawerControllerContextProvider>
            </Tag>
          </RemoveScroll>
        </FocusLock>
      </Fragment>
    </Portal>
  );
};

// Utils
// ------------------------------

function getDialogTransition(depth: number) {
  let scaleInc = 0.05;
  let transformValue = `scale(${1 - scaleInc * depth}) translateX(-${depth * 40}px)`;

  return {
    entering: { transform: 'translateX(100%)' },
    entered: { transform: transformValue },
    exiting: { transform: 'translateX(100%)' },
    exited: { transform: 'translateX(100%)' },
  };
}
