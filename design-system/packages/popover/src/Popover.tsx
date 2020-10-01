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

export const usePopover = (
  popperOptions: Partial<Options> = {},
  popoverOptions: PopoverOptions = { handleClose: 'both' }
) => {
  const [anchorElement, setAnchorElement] = useState<AnchorElementType | null>(null);
  const [popoverElement, setPopoverElement] = useState<HTMLDivElement>();
  const [arrowElement, setArrowElement] = useState<HTMLDivElement>();
  const [isOpen, setOpen] = useState(false);

  const { styles, attributes, update } = usePopper(anchorElement, popoverElement, {
    ...popperOptions,
    modifiers: [
      ...(popperOptions.modifiers || []),
      { name: 'arrow', options: { element: arrowElement } },
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
    handler: () => setOpen(false),
    elements: [anchorElement, popoverElement],
    listenWhen: ['both', 'mouse'].includes(popoverOptions.handleClose) && isOpen,
  });

  // close on esc press
  useKeyPress({
    targetKey: 'Escape',
    targetElement: popoverElement,
    downHandler: useCallback((event: KeyboardEvent) => {
      event.preventDefault(); // Avoid potential close of modal
      setOpen(false);
    }, []),
    listenWhen: ['both', 'keyboard'].includes(popoverOptions.handleClose) && isOpen,
  });

  return {
    isOpen,
    setOpen,
    trigger: {
      ref: (element: AnchorElementType | null) => setAnchorElement(element),
      props: {
        'aria-haspopup': true,
        'aria-expanded': isOpen,
      },
    },
    dialog: {
      ref: (element: HTMLDivElement) => setPopoverElement(element),
      props: {
        style: styles.popper,
        ...attributes.popper,
      },
    },
    arrow: {
      ref: (element: HTMLDivElement) => setArrowElement(element),
      props: {
        style: styles.arrow,
      },
    },
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
  const { isOpen, setOpen, trigger, dialog } = usePopover({
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
      <PopoverDialog isVisible={isOpen} ref={dialog.ref} {...dialog.props} {...props} />
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
};

export const PopoverDialog = forwardRef<HTMLDivElement, DialogProps>(
  ({ isVisible, ...props }, consumerRef) => {
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
          }}
          {...props}
        />
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
