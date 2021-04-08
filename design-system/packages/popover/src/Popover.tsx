/** @jsx jsx */

import {
  Fragment,
  ReactElement,
  ReactNode,
  Ref,
  forwardRef,
  useEffect,
  useState,
  useCallback,
  CSSProperties,
  useMemo,
} from 'react';
import { Options, Placement } from '@popperjs/core';
import { usePopper } from 'react-popper';
import { jsx, Portal, useTheme } from '@keystone-ui/core';

type AnchorElementType = HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | HTMLSpanElement;

// Hooks
// ------------------------------

// Generic Hook

type PopoverOptions = {
  handleClose: 'both' | 'mouse' | 'keyboard' | 'none';
};

export const useControlledPopover = (
  { isOpen, onClose }: { isOpen: boolean; onClose: () => void },
  popperOptions: Partial<Options> = {},
  popoverOptions: PopoverOptions = { handleClose: 'both' }
) => {
  const [anchorElement, setAnchorElement] = useState<AnchorElementType | null>(null);
  const [popoverElement, setPopoverElement] = useState<HTMLDivElement>();
  const [arrowElement, setArrowElement] = useState<HTMLDivElement>();

  const { styles, attributes, update } = usePopper(anchorElement, popoverElement, {
    ...popperOptions,
    modifiers: [
      ...(popperOptions.modifiers || []),
      { name: 'arrow', options: { element: arrowElement } },
      { name: 'eventListeners', options: { scroll: isOpen, resize: isOpen } },
    ],
  });

  // update popper when it opens to get the latest placement
  // useful for prerendered popovers in modals etc.
  useEffect(() => {
    if (update && isOpen) {
      update();
    }
  }, [isOpen, update]);

  // close on click outside
  useClickOutside({
    handler: () => onClose(),
    elements: [anchorElement, popoverElement],
    listenWhen: ['both', 'mouse'].includes(popoverOptions.handleClose) && isOpen,
  });

  // close on esc press
  useKeyPress({
    targetKey: 'Escape',
    downHandler: useCallback(
      (event: KeyboardEvent) => {
        event.preventDefault(); // Avoid potential close of modal
        onClose();
      },
      [onClose]
    ),
    listenWhen: ['both', 'keyboard'].includes(popoverOptions.handleClose) && isOpen,
  });

  return {
    trigger: useMemo(
      () => ({
        ref: setAnchorElement as (element: HTMLElement | null) => void,
        props: {
          'aria-haspopup': true,
          'aria-expanded': isOpen,
        },
      }),
      [isOpen]
    ),
    dialog: useMemo(
      () => ({
        ref: setPopoverElement as (element: HTMLElement | null) => void,
        props: {
          style: styles.popper,
          ...attributes.popper,
        },
      }),
      [styles.popper, attributes.popper]
    ),
    arrow: useMemo(
      () => ({
        ref: setArrowElement as (element: HTMLElement | null) => void,
        props: {
          style: styles.arrow,
        },
      }),
      [styles.arrow]
    ),
  };
};

export const usePopover = (
  popperOptions: Partial<Options> = {},
  popoverOptions: PopoverOptions = { handleClose: 'both' }
) => {
  const [isOpen, setOpen] = useState(false);
  return {
    isOpen,
    setOpen,
    ...useControlledPopover(
      { isOpen, onClose: useCallback(() => setOpen(false), []) },
      popperOptions,
      popoverOptions
    ),
  };
};

// Component
// ------------------------------

export type TriggerRendererOptions = {
  isOpen: boolean;
  triggerProps: {
    onClick: () => void;
    ref: Ref<any>;
  };
};
type Props = {
  /** The content of the dialog. */
  children: ReactNode;
  /** Where, in relation to the trigger, to place the dialog. */
  placement?: Placement;
  /** The trigger element, which the dialog is bound to. */
  triggerRenderer: (options: TriggerRendererOptions) => ReactElement;
};

export const Popover = ({ placement = 'bottom', triggerRenderer, ...props }: Props) => {
  const { isOpen, setOpen, trigger, dialog, arrow } = usePopover({
    placement,
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
    ],
  });

  return (
    <Fragment>
      {triggerRenderer({
        isOpen,
        triggerProps: {
          ref: trigger.ref,
          ...trigger.props,
          onClick: () => setOpen(true),
        },
      })}
      <PopoverDialog
        isVisible={isOpen}
        arrow={arrow}
        ref={dialog.ref}
        {...dialog.props}
        {...props}
      />
    </Fragment>
  );
};

// Dialog
// ------------------------------

type DialogProps = {
  /** The content of the dialog. */
  children: ReactNode;
  /** When true, the popover will be visible. */
  isVisible: boolean;
  arrow: {
    ref: (element: HTMLDivElement) => void;
    props: {
      style: CSSProperties;
    };
  };
};

export const PopoverDialog = forwardRef<HTMLDivElement, DialogProps>(
  ({ isVisible, children, arrow, ...props }, consumerRef) => {
    const { elevation, radii, shadow, colors } = useTheme();

    return (
      <Portal>
        <div
          ref={consumerRef}
          css={{
            background: colors.background,
            borderRadius: radii.medium,
            boxShadow: shadow.s300,
            opacity: isVisible ? 1 : 0,
            pointerEvents: isVisible ? undefined : 'none',
            zIndex: elevation.e500, // on top of drawers
            ...useArrowStyles(),
          }}
          {...props}
        >
          <div data-popper-arrow ref={arrow.ref} className="tooltipArrow" {...arrow.props} />

          {children}
        </div>
      </Portal>
    );
  }
);

// TODO: maybe we should add an invisible blanket and have a regular react event listener on that instead of this?

// NOTE: mouse event handler defined here rather than imported from react becase
// the event listener will return a native event, not a synthetic event
type MouseHandler = (event: MouseEvent) => void;
type UseClickOutsideProps = {
  handler: MouseHandler;
  elements: (HTMLElement | undefined | null)[];
  listenWhen: boolean;
};

const useClickOutside = ({ handler, elements, listenWhen }: UseClickOutsideProps) => {
  useEffect(() => {
    if (listenWhen) {
      let handleMouseDown = (event: MouseEvent) => {
        // bail on mouse down "inside" any of the provided elements
        if (elements.some(el => el && el.contains(event.target as Node))) {
          return;
        }

        handler(event);
      };
      document.addEventListener('mousedown', handleMouseDown);

      return () => {
        document.removeEventListener('mousedown', handleMouseDown);
      };
    }
  }, [handler, elements, listenWhen]);
};

type KeyboardHandler = (event: KeyboardEvent) => void;
type UseKeyPressProps = {
  targetKey: string;
  targetElement?: HTMLElement | null;
  downHandler?: KeyboardHandler;
  upHandler?: KeyboardHandler;
  listenWhen: boolean;
};

const useKeyPress = ({
  targetKey,
  targetElement,
  downHandler,
  upHandler,
  listenWhen,
}: UseKeyPressProps) => {
  // Keep track of whether the target key is pressed
  const [keyPressed, setKeyPressed] = useState(false);

  // add event listeners
  useEffect(() => {
    let target = targetElement || document.body;
    let onDown = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(true);

        if (typeof downHandler === 'function') {
          downHandler(event);
        }
      }
    };
    let onUp = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(false);

        if (typeof upHandler === 'function') {
          upHandler(event);
        }
      }
    };
    if (listenWhen) {
      target.addEventListener('keydown', onDown);
      target.addEventListener('keyup', onUp);

      // Remove event listeners on cleanup
      return () => {
        target.removeEventListener('keydown', onDown);
        target.removeEventListener('keyup', onUp);
      };
    }
  }, [listenWhen, targetKey, downHandler, upHandler, targetElement]);

  return keyPressed;
};

const useArrowStyles = () => {
  const theme = useTheme();
  const size = 16;
  return {
    '& [data-popper-arrow]': {
      position: 'absolute',
      overflow: 'hidden',
      pointerEvents: 'none',
      height: size * 2,
      width: size * 2,
      '&::after': {
        content: '""',
        position: 'absolute',
        background: theme.colors.background,
        width: size,
        height: size,
        transform: 'translateX(-50%) translateY(-50%) rotate(45deg)',
        boxShadow: theme.shadow.s200,
      },
    },
    "&[data-popper-placement^='left'] > [data-popper-arrow]": {
      left: '100%',
      '&::after': {
        top: '50%',
        left: '0',
      },
    },
    "&[data-popper-placement^='right'] > [data-popper-arrow]": {
      right: '100%',
      '&::after': {
        top: '50%',
        left: '100%',
      },
    },
    "&[data-popper-placement^='top'] > [data-popper-arrow]": {
      top: '100%',
      '&::after': {
        top: 0,
        bottom: '-50%',
        left: '50%',
      },
    },
    "&[data-popper-placement^='bottom'] > [data-popper-arrow]": {
      bottom: '100%',
      right: 'unset',
      '&::after': {
        bottom: '-50%',
        left: '50%',
      },
    },
  } as const;
};
