/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useRef, useEffect } from 'react';

let importPromise;

const Preview = ({ url, options }) => {
  let containerRef = useRef(null);

  useEffect(() => {
    if (!importPromise) {
      importPromise = import('@iframely/embed.js').then(() => {
        window.iframely.extendOptions({ key: options.clientApiKey });
      });
    }

    // Tell iframely to always re-render when the current ref changes
    importPromise.then(() => {
      while (containerRef.current.lastChild) {
        // iframely.load is not clearing old content from container,
        // so we should do it manually
        // @iframely/embed.js <= 1.3.1
        containerRef.current.removeChild(containerRef.current.lastChild);
      }
      window.iframely.load(containerRef.current, url);
    });
  }, [url, containerRef.current]);

  return <div ref={containerRef} />;
};

export default Preview;
