import React, {
  Fragment,
  memo,
  forwardRef,
  useState,
  useDebugValue,
  useEffect,
  useRef,
  useImperativeHandle,
} from 'react';
import ScrollLock from 'react-scrolllock';
import { TransitionProvider } from './transitions';

const getDisplayName = C => {
  return `withModalHandlers(${C.displayName || C.name || 'Component'})`;
};

const Target = memo(({ isOpen, mode, target, targetRef, open, toggle }) => {
  const cloneProps = { isActive: isOpen, ref: targetRef };
  if (mode === 'click') cloneProps.onClick = toggle;
  if (mode === 'contextmenu') cloneProps.onContextMenu = open;
  return target(cloneProps);
});

const withModalHandlers = (WrappedComponent, { transition }) => {
  return forwardRef(
    (
      {
        defaultIsOpen = false,
        mode = 'click',
        onClose = () => {},
        onOpen = () => {},
        target,
        ...props
      },
      ref
    ) => {
      const [isOpen, setIsOpen] = useState(defaultIsOpen);

      // TODO: remove. Wrapped components (currently only Dropdown) use these for calculating position,
      // but react-popper should be used instead
      const [clientX, setClientX] = useState(0);
      const [clientY, setClientY] = useState(0);

      const contentNode = useRef();
      const targetNode = useRef();

      // Expose open() and close() for via ref
      useImperativeHandle(ref, () => ({ open, close }));

      useEffect(() => {
        // If the dialog was closed, don't do anything. The cleanup function already removed the handlers.
        if (!isOpen) return;

        const handleMouseDown = event => {
          const { target } = event;

          if (!(target instanceof HTMLElement) && !(target instanceof SVGElement)) {
            return;
          }

          const clickNotIn = node => !node.current.contains(target);

          // NOTE: Why not use the <Blanket /> component to close?
          // We don't want to interrupt the user's flow. Taking this approach allows
          // user to click "through" to other elements and close the popout.
          if (isOpen && clickNotIn(contentNode) && clickNotIn(targetNode)) {
            close(event);
          }
        };

        const handleKeyDown = event => {
          const { key } = event;

          if (key === 'Escape') {
            close(event);
          }
        };

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('keydown', handleKeyDown, false);

        return () => {
          document.removeEventListener('mousedown', handleMouseDown);
          document.removeEventListener('keydown', handleKeyDown, false);
        };
      }, [isOpen]);

      useDebugValue(getDisplayName(WrappedComponent));

      const open = event => {
        if (event.defaultPrevented) return;
        if (mode === 'contextmenu') event.preventDefault();

        const { clientX, clientY } = event;

        setIsOpen(true);
        setClientX(clientX);
        setClientY(clientY);
      };

      const close = event => {
        if (event && event.defaultPrevented) return;

        setIsOpen(false);
        setClientX(0);
        setClientY(0);
      };

      const toggle = event => {
        if (isOpen) {
          close(event);
        } else {
          open(event);
        }
      };

      const getTarget = ref => {
        targetNode.current = ref;
      };

      const getContent = ref => {
        contentNode.current = ref;
      };

      return (
        <Fragment>
          <Target
            targetRef={getTarget}
            target={target}
            mode={mode}
            isOpen={isOpen}
            toggle={toggle}
            open={open}
          />
          {isOpen && <ScrollLock />}
          <TransitionProvider isOpen={isOpen} onEntered={onOpen} onExited={onClose}>
            {transitionState => (
              <WrappedComponent
                close={close}
                open={open}
                getModalRef={getContent}
                targetNode={targetNode.current}
                contentNode={contentNode.current}
                isOpen={isOpen}
                mouseCoords={{ clientX, clientY }}
                style={transition(transitionState)}
                {...props}
              />
            )}
          </TransitionProvider>
        </Fragment>
      );
    }
  );
};

export default withModalHandlers;
