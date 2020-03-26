import { useCallback, useLayoutEffect, useRef } from 'react';

export const useClickOutside = ({ handler, refs, listenWhen }) => {
  const ref = useRef(null);

  const handleMouseDown = useCallback(
    event => {
      // bail on mouse down "inside" any of the provided refs
      if (refs.some(ref => ref.current && ref.current.contains(event.target))) {
        return;
      }

      handler(event);
    },
    [handler, refs]
  );

  // layout effect is not run on the server
  useLayoutEffect(() => {
    if (listenWhen) {
      document.addEventListener('mousedown', handleMouseDown);

      return () => {
        document.removeEventListener('mousedown', handleMouseDown);
      };
    }
    // NOTE: only call when the value of `listenWhen` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listenWhen]);

  return ref;
};
