/** @jsx jsx */

import { HTMLAttributes, ReactNode, forwardRef, useEffect, useMemo, useState } from 'react';
import { jsx, keyframes, Portal, useTheme } from '@keystone-ui/core';
import { AlertOctagonIcon } from '@keystone-ui/icons/icons/AlertOctagonIcon';
import { AlertTriangleIcon } from '@keystone-ui/icons/icons/AlertTriangleIcon';
import { CheckCircleIcon } from '@keystone-ui/icons/icons/CheckCircleIcon';
import { InfoIcon } from '@keystone-ui/icons/icons/InfoIcon';
import { XIcon } from '@keystone-ui/icons/icons/XIcon';

import { ToastContext } from './context';
import { ToastProps, ToastPropsExact } from './types';

// Provider
// ------------------------------

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toastStack, setToastStack] = useState<ToastPropsExact[]>([]);

  const context = useMemo(
    () => ({
      addToast: (options: ToastProps) => {
        setToastStack(currentStack => {
          // only allow unique IDs in the toast stack
          if (currentStack.some(toast => toast.id === options.id)) {
            console.error(`You cannot add more than one toast with the same id ("${options.id}").`);
            return currentStack;
          }

          // populate defaults and update state
          let toast = populateDefaults(options);
          return [...currentStack, toast];
        });
      },
      removeToast: (id: string) => {
        setToastStack(currentStack => currentStack.filter(t => t.id !== id));
      },
    }),
    []
  );

  return (
    <ToastContext.Provider value={context}>
      {children}
      <ToastContainer>
        {toastStack.map((props: ToastPropsExact) => {
          const { id, message, preserve, title, tone } = props;
          const onDismiss = () => context.removeToast(id);

          return (
            <ToastElement
              key={id}
              message={message}
              preserve={preserve}
              onDismiss={onDismiss}
              title={title}
              tone={tone}
            />
          );
        })}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

// Utils
// ------------------------------

let idCount = -1;
let genId = () => ++idCount;
function populateDefaults(props: ToastProps): ToastPropsExact {
  return {
    title: props.title,
    message: props.message,
    preserve: Boolean(props.preserve),
    id: props.id || String(genId()),
    tone: props.tone || 'help',
  };
}

// Styled Components
// ------------------------------

// Container

const ToastContainer = (props: HTMLAttributes<HTMLDivElement>) => {
  const { elevation } = useTheme();

  return (
    <Portal>
      <div
        css={{
          position: 'fixed',
          right: 0,
          top: 0,
          zIndex: elevation.e500,
        }}
        {...props}
      />
    </Portal>
  );
};

// Element

const AUTO_DISMISS_DURATION = 6000;
const slideInFrames = keyframes({
  from: { transform: 'translateX(100%)' },
  to: { transform: 'translateX(0)' },
});

type ToastElementProps = {
  onDismiss: () => void;
} & Omit<ToastPropsExact, 'id'>;

export const ToastElement = forwardRef<HTMLDivElement, ToastElementProps>((props, ref) => {
  const { message, onDismiss, preserve, title, tone, ...rest } = props;
  const { radii, shadow, spacing, typography, colors, sizing, tones } = useTheme();

  // auto-dismiss functionality
  useEffect(() => {
    if (!preserve) {
      const timer = setTimeout(onDismiss, AUTO_DISMISS_DURATION);
      return () => clearTimeout(timer);
    }
    // this is not like other components because the consumer cannot update the props once they `addToast()`
    // we intentionally only want this to be run when the toast element mounts/unmounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iconElement = {
    positive: <CheckCircleIcon color={tones.positive.fill[0]} size="large" />,
    negative: <AlertOctagonIcon color={tones.negative.fill[0]} size="large" />,
    warning: <AlertTriangleIcon color={tones.warning.fill[0]} size="large" />,
    help: <InfoIcon color={tones.help.fill[0]} size="large" />,
  }[tone];

  return (
    <div
      ref={ref}
      css={{
        alignItems: 'center',
        animation: `${slideInFrames} 150ms cubic-bezier(0.2, 0, 0, 1)`,
        background: colors.background,
        borderRadius: radii.medium,
        boxShadow: shadow.s500,
        display: 'flex',
        fontSize: typography.fontSize.small,
        lineHeight: 1,
        margin: spacing.medium,
        padding: spacing.large,
      }}
      {...rest}
    >
      {iconElement}
      <div
        css={{
          flex: 1,
          maxWidth: 256, // less than desirable magic number, but not sure if this needs to be in theme...
          paddingLeft: spacing.large,
          paddingRight: spacing.large,
        }}
      >
        <h3
          css={{
            fontSize: typography.fontSize.medium,
            fontWeight: typography.fontWeight.bold,
            margin: 0,
          }}
        >
          {title}
        </h3>
        {message && (
          <div
            css={{
              color: colors.foreground,
              lineHeight: typography.leading.base,
              marginTop: spacing.small,
            }}
          >
            {message}
          </div>
        )}
      </div>
      <button
        onClick={onDismiss}
        css={{
          alignItems: 'center',
          background: 0,
          border: 0,
          borderRadius: '50%',
          color: colors.foreground,
          cursor: 'pointer',
          display: 'flex',
          height: sizing.small,
          justifyContent: 'center',
          outline: 0,
          padding: 0,
          width: sizing.small,

          ':hover, &.focus-visible': {
            backgroundColor: colors.background,
          },
          ':active': {
            backgroundColor: colors.backgroundDim,
          },
        }}
      >
        <XIcon size="small" />
      </button>
    </div>
  );
});
