import ResizeObserver from 'resize-observer-polyfill';

import { useLayoutEffect, useState, MutableRefObject } from 'react';

export function useMeasure(ref: MutableRefObject<any>) {
  let [snapshot, setSnapshot] = useState(() => ({ height: 0, width: 0 }));

  useLayoutEffect(() => {
    let element = ref.current;
    if (element !== null) {
      let resizeObserver = new ResizeObserver(([entry]) => {
        // @ts-ignore
        const height = entry.target.offsetHeight;
        // @ts-ignore
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
