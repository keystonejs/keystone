export { default as useScrollListener } from './useScrollListener';
export { default as useWindowSize } from './useWindowSize';
import { useState, useCallback } from 'react';

export function useStateWithEqualityCheck(initialValue) {
  let [value, _setValue] = useState(initialValue);

  let setValue = useCallback(
    newValue => {
      if (newValue !== value) {
        _setValue(newValue);
      }
    },
    [value]
  );

  return [value, setValue];
}
