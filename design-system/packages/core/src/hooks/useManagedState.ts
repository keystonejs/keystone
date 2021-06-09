import { ChangeEvent, useRef, useState } from 'react';

import { devWarning } from '../utils';

export type ManagedChangeHandler<V = string, E = ChangeEvent> = (value: V, event: E) => void;

export function useManagedState<V, E = ChangeEvent>(
  controlledValue: V | undefined,
  defaultValue: V,
  onChange: ManagedChangeHandler<V, E> | undefined
): [V, ManagedChangeHandler<V, E>] {
  const { current: isControlled } = useRef(controlledValue !== undefined);
  const [internalValue, setInternalValue] = useState<V>(defaultValue);

  // warn consumers when their component is switching from controlled to uncontrolled and vice versa
  devWarning(
    isControlled && controlledValue === undefined,
    'A component is changing from controlled to uncontrolled. Check the `value` prop being passed in.'
  );
  devWarning(
    !isControlled && controlledValue !== undefined,
    'A component is changing from uncontrolled to controlled. Check the `value` prop being passed in.'
  );

  // handle value changes (both internal, and controlled)
  const setValue = (v: V, e: E) => {
    if (typeof onChange === 'function') {
      onChange(v, e);
    }

    setInternalValue(v);
  };

  // determine which value to pass on
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  return [value, setValue];
}
