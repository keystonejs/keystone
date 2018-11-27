// @flow
import * as React from 'react';

// this is for new react features that haven't been added to flow yet
// once they're in flow, this file can be removed

type InputArray = $ReadOnlyArray<mixed> | void | null;

export const memo: <Props>(
  (props: Props) => React.Node,
  isEqual?: (Props, Props) => boolean
) => React.ComponentType<Props> = (React: any).memo;

export const useState: <State>(
  initialState: (() => State) | State
) => [State, ((State => State) | State) => void] = (React: any).useState;

export const useRef: <Value>(initalValue: Value) => {| current: Value |} = (React: any).useRef;

export const useMemo: <Value>(() => Value, $ReadOnlyArray<any>) => Value = (React: any).useMemo;

export const useLayoutEffect: (() => mixed, mem: InputArray) => void = (React: any).useLayoutEffect;

export const useEffect: (() => mixed, mem: InputArray) => void = (React: any).useEffect;

export const useMutationEffect: (() => mixed, mem: InputArray) => void = (React: any)
  .useMutationEffect;

export const useCallback: <T>(callback: T, inputs: InputArray) => T = (React: any).useCallback;
