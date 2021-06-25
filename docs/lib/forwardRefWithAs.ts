import {
  ComponentPropsWithoutRef,
  ElementType,
  ReactElement,
  ReactNode,
  Ref,
  forwardRef,
} from 'react';

type ElementTagNameMap = HTMLElementTagNameMap &
  Pick<SVGElementTagNameMap, Exclude<keyof SVGElementTagNameMap, keyof HTMLElementTagNameMap>>;

type AsProp<Comp extends ElementType> = {
  as?: Comp;
  ref?: Ref<
    Comp extends keyof ElementTagNameMap
      ? ElementTagNameMap[Comp]
      : Comp extends new (...args: any) => any
      ? InstanceType<Comp>
      : undefined
  >;
} & Omit<ComponentPropsWithoutRef<Comp>, 'as'>;

type CompWithAsProp<Props, DefaultElementType extends ElementType> = {
  displayName?: string;
  <Comp extends ElementType = DefaultElementType>(props: AsProp<Comp> & Props): ReactElement;
};

export const forwardRefWithAs = <DefaultElementType extends ElementType, BaseProps>(
  render: (
    props: BaseProps & { as?: ElementType },
    ref: React.Ref<any>
  ) => Exclude<ReactNode, undefined>
): CompWithAsProp<BaseProps, DefaultElementType> => {
  // @ts-ignore
  return forwardRef(render);
};
