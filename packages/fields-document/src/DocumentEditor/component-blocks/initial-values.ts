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
      return null;
    case 'relationship':
      return prop.many ? [] : null;
    case 'conditional': {
      const defaultValue = prop.discriminant.defaultValue;
      return {
        discriminant: defaultValue,
        value: getInitialPropsValue(prop.values[defaultValue.toString()]),
      };
    }
    case 'object': {
      let obj: Record<string, any> = {};
      Object.keys(prop.value).forEach(key => {
        obj[key] = getInitialPropsValue(prop.value[key]);
      });
      return obj;
    }
    case 'array': {
      return [];
    }
  }
  assertNever(prop);
}

export function getInitialPropsValueFromInitializer(
  prop: ComponentPropField,
  initializer: any
): any {
  switch (prop.kind) {
    case 'form':
      return initializer === undefined ? prop.defaultValue : initializer;
    case 'child':
      return null;
    case 'relationship':
      return initializer === undefined ? (prop.many ? [] : null) : initializer;
    case 'conditional': {
      const defaultValue =
        initializer === undefined ? prop.discriminant.defaultValue : initializer.discriminant;
      return {
        discriminant: defaultValue,
        value: getInitialPropsValueFromInitializer(
          prop.values[defaultValue.toString()],
          initializer === undefined ? undefined : initializer.value
        ),
      };
    }
    case 'object': {
      let obj: Record<string, any> = {};
      Object.keys(prop.value).forEach(key => {
        obj[key] = getInitialPropsValueFromInitializer(
          prop.value[key],
          initializer === undefined ? undefined : initializer[key]
        );
      });
      return obj;
    }
    case 'array': {
      return ((initializer ?? []) as unknown[]).map(x =>
        getInitialPropsValueFromInitializer(prop.element, x)
      );
    }
  }
  assertNever(prop);
}
