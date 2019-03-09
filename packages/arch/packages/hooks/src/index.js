import ResizeObserver from 'resize-observer-polyfill';

import { useLayoutEffect, useState } from 'react';

export function useMeasure(ref) {
  let [snapshot, setSnapshot] = useState(() => ({ height: 0, width: 0 }));

  useLayoutEffect(() => {
    let element = ref.current;
    if (element !== null) {
      let resizeObserver = new ResizeObserver(([entry]) => {
        const height = entry.target.offsetHeight;
        const width = entry.target.offsetWidth;
        if (width !== snapshot.width || height !== snapshot.height) {
          setSnapshot({ width, height });
        }
      });
      resizeObserver.observe(element);
      return () => {
        resizeObserver.unobserve(element);
      };
    }
  });

  return snapshot;
}
