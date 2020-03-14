export { default as useScrollListener } from './useScrollListener';
export { default as useWindowSize } from './useWindowSize';
import { useState, useCallback } from 'react';

export function useStateWithEqualityCheck(initialValue) {
  const [value, _setValue] = useState(initialValue);

  const setValue = useCallback(
    newValue => {
      if (newValue !== value) {
        _setValue(newValue);
      }
    },
    [value]
  );

  return [value, setValue];
}
