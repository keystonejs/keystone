import { useEffect, useState } from 'react';

const isBrowser = typeof window !== 'undefined';

function getSize() {
  if (isBrowser) {
    return {
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth,
    };
  }
  return {
    innerHeight: 0,
    innerWidth: 0,
  };
}

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState(getSize());

  useEffect(() => {
    function handleResize() {
      setWindowSize(getSize());
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setWindowSize]);

  return windowSize;
}
