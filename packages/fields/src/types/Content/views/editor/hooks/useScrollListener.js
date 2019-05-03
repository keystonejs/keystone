import { useEffect } from 'react';

export default function useScrollListener(handler) {
  useEffect(() => {
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, [handler]);
}
