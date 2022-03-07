import { ComponentPropField, ComponentBlock } from '../../component-blocks';
import { assertNever, findChildPropPaths } from './utils';

export function getInitialValue(type: string, componentBlock: ComponentBlock) {
  const props = getInitialPropsValue({ kind: 'object', value: componentBlock.props });
  return {
    type: 'component-block' as const,
    component: type,
    props,
    children: findChildPropPaths(props, componentBlock.props).map(x => ({
      type: `component-${x.options.kind}-prop` as const,
      propPath: x.path,
      children: [
        x.options.kind === 'block'
          ? { type: 'paragraph' as const, children: [{ text: '' }] }
          : { text: '' },
      ],
    })),
  };
}

export function getInitialPropsValue(prop: ComponentPropField): any {
  switch (prop.kind) {
    case 'form':
      return prop.defaultValue;
    case 'child':
      return undefined;
    case 'relationship':
      return prop.many ? [] : null;
    case 'conditional': {
      const defaultValue = prop.discriminant.defaultValue;
      return {
        discriminant: defaultValue,
        value: getInitialPropsValue(prop.values[defaultValue]),
      };
    }
    case 'object': {
      let obj: Record<string, any> = {};
      Object.keys(prop.value).forEach(key => {
        obj[key] = getInitialPropsValue(prop.value[key]);
      });
      return obj;
    }
  }
  assertNever(prop);
}
