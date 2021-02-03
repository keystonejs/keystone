import {
  ComponentPropsWithoutRef,
  ElementType,
  forwardRef,
  ReactElement,
  ReactNode,
  Ref,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

/*
  @johannes' one weird trick for fixing TypeScript autocomplete
*/
export function identityType<T>() {
  function inner<U extends T>(u: U): U {
    return u;
  }
  return inner;
}

/*
  Logs a warning to the console when the condition is true, only in dev
*/
export const devWarning = (condition: boolean, message: string) => {
  if (process.env.NODE_ENV !== 'production') {
    if (condition) {
      console.error(message);
    }
  }
};

/*
  forwardRefWithAs lets us forward refs while keeping the correct component type,
  which can be specified by the `as` prop.
*/

type ElementTagNameMap = HTMLElementTagNameMap &
  Pick<SVGElementTagNameMap, Exclude<keyof SVGElementTagNameMap, keyof HTMLElementTagNameMap>>;

type AsProp<Comp extends ElementType, Props> = {
  as?: Comp;
  ref?: Ref<
    Comp extends keyof ElementTagNameMap
      ? ElementTagNameMap[Comp]
      : Comp extends new (...args: any) => any
      ? InstanceType<Comp>
      : undefined
  >;
} & Omit<ComponentPropsWithoutRef<Comp>, 'as' | keyof Props>;

type CompWithAsProp<Props, DefaultElementType extends ElementType> = <
  Comp extends ElementType = DefaultElementType
>(
  props: AsProp<Comp, Props> & Props
) => ReactElement;

export const forwardRefWithAs = <DefaultElementType extends ElementType, BaseProps>(
  render: (
    props: BaseProps & { as?: ElementType },
    ref: React.Ref<any>
  ) => Exclude<ReactNode, undefined>
): CompWithAsProp<BaseProps, DefaultElementType> => {
  // @ts-ignore
  return forwardRef(render);
};

/*
  A helper for making valid IDs from a set of inputs
*/
export function makeId(...args: (string | number | null | undefined)[]) {
  return args.filter(val => val != null).join('--');
}

/*
  A helper for handling string OR array values e.g.

  <Component size="small" />
  VS
  <Component size={['small', 'large']} />
*/
export const mapResponsiveProp = <
  Map extends Record<string, string | number>,
  Keys extends keyof Map
>(
  value: Keys | readonly (Keys | null)[],
  valueMap: Map
) => {
  if (Array.isArray(value)) {
    return value.map(k => (k == null ? null : valueMap[k]));
  }
  // @ts-ignore
  return valueMap[value];
};

/**
 * Utils below are ported with thanks from @reach-ui
 * Copyright (c) 2018-present, React Training LLC
 */

// Autogenerate IDs to facilitate WAI-ARIA and server rendering. For reasoning, see
// https://github.com/reach/reach-ui/blob/develop/packages/auto-id/src/index.tsx
let serverHandoffComplete = false;
let id = 0;
const genId = () => ++id;

export const useId = (idFromProps?: string | null) => {
  const initialId = idFromProps || (serverHandoffComplete ? genId() : null);

  const [id, setId] = useState(initialId);

  useSafeLayoutEffect(() => {
    if (id === null) {
      setId(genId());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (serverHandoffComplete === false) {
      serverHandoffComplete = true;
    }
  }, []);
  return id != null ? String(id) : undefined;
};

// Works around useLayoutEffect throwing a warning when used in SSR
export const useSafeLayoutEffect = typeof window === 'undefined' ? () => {} : useLayoutEffect;

type Props = {
  children: ReactElement;
};

export const Portal = ({ children }: Props) => {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(children, document.body);
};
