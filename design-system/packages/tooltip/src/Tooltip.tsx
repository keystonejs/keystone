/** @jsx jsx */

import { Fragment, ReactElement, forwardRef, Ref, CSSProperties } from 'react';
import { jsx, useId, useTheme, Portal } from '@keystone-ui/core';
import { usePopover } from '@keystone-ui/popover';

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
  content: string;
  /** Where, in relation to the target, to place the tooltip. */
  placement?: 'top' | 'right' | 'bottom' | 'left';
};

export const Tooltip = ({ children, content, placement = 'top' }: Props) => {
  const { isOpen, setOpen, trigger, dialog, arrow } = usePopover({
    placement,
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 12],
        },
      },
    ],
  });

  const tooltipId = useId();
  const showTooltip = () => setOpen(true);
  const hideTooltip = () => setOpen(false);

  return (
    <Fragment>
      {children({
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: showTooltip,
        onBlur: hideTooltip,
        'aria-describedby': tooltipId,
        ref: trigger.ref,
      })}
      <TooltipElement
        id={tooltipId}
        isVisible={isOpen}
        ref={dialog.ref}
        {...dialog.props}
        arrow={arrow}
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
  children: string;
  /** ID used to describe the invoking element. */
  id?: string;
  /** When true, the tooltip will be visible. */
  isVisible: boolean;
  arrow: {
    ref: (element: HTMLDivElement) => void;
    props: {
      style: CSSProperties;
    };
  };
};

// TODO: don't do this
const backgroundColor = '#253858';

export const TooltipElement = forwardRef<HTMLDivElement, ElementProps>(
  ({ isVisible, children, arrow, ...props }, consumerRef) => {
    const { elevation, radii, colors, shadow, spacing, typography } = useTheme();

    const arrowStyles = useArrowStyles();

    return (
      <Portal>
        <div
          role="tooltip"
          aria-hidden={!isVisible}
          ref={consumerRef}
          css={{
            backgroundColor,
            borderRadius: radii.xsmall,
            boxShadow: shadow.s200,
            color: colors.background,
            fontSize: typography.fontSize.small,
            fontWeight: typography.fontWeight.medium,
            lineHeight: typography.leading.base,
            maxWidth: 256, // less than desirable magic number, but not sure if this needs to be in theme...
            opacity: isVisible ? 1 : 0,
            padding: `${spacing.small}px ${spacing.medium}px`,
            pointerEvents: isVisible ? undefined : 'none',
            zIndex: elevation.e500,
            ...arrowStyles,
          }}
          {...props}
        >
          {children}
          <div data-popper-arrow ref={arrow.ref} className="tooltipArrow" {...arrow.props} />
        </div>
      </Portal>
    );
  }
);

const useArrowStyles = () => {
  const theme = useTheme();
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
        backgroundColor,
        transform: 'translateX(-50%) translateY(-50%) rotate(45deg)',
        boxShadow: theme.shadow.s200,
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
