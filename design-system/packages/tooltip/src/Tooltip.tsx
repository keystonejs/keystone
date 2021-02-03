/** @jsx jsx */

import {
  CSSProperties,
  Fragment,
  ReactElement,
  Ref,
  forwardRef,
  useEffect,
  useRef,
  memo,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { applyRefs } from 'apply-ref';
import { jsx, useId, useTheme, Portal } from '@keystone-ui/core';
import { usePopover } from '@keystone-ui/popover';

type Weights = 'bold' | 'subtle';

type RenderProps = {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  'aria-describedby': string | undefined;
  ref: Ref<any>;
};

type Props = {
  /** The target element. */
  children: (props: RenderProps) => ReactElement;
  /** The content of the tooltip. */
  content: ReactNode;
  /** Turn off, to maintain the tooltip when the user clicks the trigger element. */
  hideOnClick?: boolean;
  /** Where, in relation to the target, to place the tooltip. */
  placement?: 'top' | 'right' | 'bottom' | 'left';
  /** The visual weight of the tooltip. */
  weight?: Weights;
};

export const Tooltip = ({
  children,
  content,
  hideOnClick = true,
  placement = 'top',
  weight = 'bold',
}: Props) => {
  const { spacing } = useTheme();
  const isBold = weight === 'bold';

  const { isOpen, setOpen, trigger, dialog, arrow } = usePopover({
    placement,
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, isBold ? spacing.small : spacing.xsmall],
        },
      },
    ],
  });

  const tooltipId = useId();
  const showTooltip = useCallback(() => setOpen(true), []);
  const hideTooltip = useCallback(() => setOpen(false), []);
  const internalRef = useRef<HTMLElement>(null);

  // avoid overriding the consumer's `onClick` handler
  useEffect(() => {
    const triggerEl = internalRef.current;

    if (hideOnClick && triggerEl) {
      triggerEl.addEventListener('click', hideTooltip);

      return () => triggerEl.removeEventListener('click', hideTooltip);
    }
  }, [isOpen]);

  return (
    <Fragment>
      {useMemo(
        () =>
          children({
            onMouseEnter: showTooltip,
            onMouseLeave: hideTooltip,
            onFocus: showTooltip,
            onBlur: hideTooltip,
            'aria-describedby': tooltipId,
            ref: applyRefs(trigger.ref, internalRef),
          }),
        [children, showTooltip, hideTooltip, tooltipId, trigger.ref, internalRef]
      )}
      <TooltipElement
        id={tooltipId}
        isVisible={isOpen}
        weight={weight}
        ref={dialog.ref}
        {...dialog.props}
        arrow={weight === 'bold' ? arrow : undefined}
      >
        {content}
      </TooltipElement>
    </Fragment>
  );
};

// Styled Component
// ------------------------------

type ElementProps = {
  /** The content of the tooltip. */
  children: ReactNode;
  /** ID used to describe the invoking element. */
  id?: string;
  /** When true, the tooltip will be visible. */
  isVisible: boolean;
  /** The visual weight of the tooltip. */
  weight: Weights;
  /** Popper's arrow config. */
  arrow?: {
    ref: (element: HTMLDivElement) => void;
    props: {
      style: CSSProperties;
    };
  };
};

export const TooltipElement = memo(
  forwardRef<HTMLDivElement, ElementProps>(
    ({ isVisible, children, arrow, weight, ...props }, consumerRef) => {
      const isBold = weight === 'bold';
      const { elevation, radii, colors, spacing, typography } = useTheme();
      const arrowStyles = useArrowStyles();

      return (
        <Portal>
          <div
            role="tooltip"
            aria-hidden={!isVisible}
            ref={consumerRef}
            css={{
              backgroundColor: colors.foregroundMuted,
              borderRadius: radii.xsmall,
              color: colors.background,
              fontSize: isBold ? typography.fontSize.small : typography.fontSize.xsmall,
              fontWeight: typography.fontWeight.medium,
              lineHeight: typography.leading.tight,
              maxWidth: 320, // less than desirable magic number, but not sure if this needs to be in theme...
              opacity: isVisible ? (isBold ? 1 : 0.9) : 0,
              padding: isBold
                ? `${spacing.small}px ${spacing.medium}px`
                : `${spacing.xsmall}px ${spacing.small}px`,
              pointerEvents: isVisible ? undefined : 'none',
              zIndex: elevation.e500,
              ...arrowStyles,
            }}
            {...props}
          >
            {children}
            {arrow && (
              <div data-popper-arrow ref={arrow.ref} className="tooltipArrow" {...arrow.props} />
            )}
          </div>
        </Portal>
      );
    }
  )
);

const useArrowStyles = () => {
  const { colors } = useTheme();
  return {
    '.tooltipArrow': {
      position: 'absolute',
      overflow: 'hidden',
      pointerEvents: 'none',
      height: '20px',
      width: '20px',
      '&::after': {
        content: 'close-quote',
        position: 'absolute',
        width: '10px',
        height: '10px',
        backgroundColor: colors.foregroundMuted,
        transform: 'translateX(-50%) translateY(-50%) rotate(45deg)',
      },
    },
    "&[data-popper-placement^='left'] > .tooltipArrow": {
      left: '100%',
      '&::after': {
        top: '50%',
        left: '0',
      },
    },
    "&[data-popper-placement^='right'] > .tooltipArrow": {
      right: '100%',
      '&::after': {
        top: '50%',
        left: '100%',
      },
    },
    "&[data-popper-placement^='top'] > .tooltipArrow": {
      top: '100%',
      '&::after': {
        top: 0,
        bottom: '-50%',
        left: '50%',
      },
    },
    "&[data-popper-placement^='bottom'] > .tooltipArrow": {
      bottom: '100%',
      right: 'unset',
      '&::after': {
        bottom: '-50%',
        left: '50%',
      },
    },
  } as const;
};
