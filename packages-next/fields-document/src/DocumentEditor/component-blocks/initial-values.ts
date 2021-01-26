import { ComponentPropField, ComponentBlock } from '../../component-blocks';
import { Relationships } from '../relationship';
import { assertNever, findChildPropPaths } from './utils';

export function getInitialValue(
  type: string,
  componentBlock: ComponentBlock,
  relationships: Relationships
) {
  const props = getInitialPropsValue(
    { kind: 'object', value: componentBlock.props },
    relationships
  );
  return {
    type: 'component-block',
    component: type,
    props,
    children: findChildPropPaths(props, componentBlock.props).map(x => ({
      type: `component-${x.options.kind}-prop`,
      propPath: x.path,
      children: [
        x.options.kind === 'block' ? { type: 'paragraph', children: [{ text: '' }] } : { text: '' },
      ],
    })),
  };
}

export function getInitialPropsValue(prop: ComponentPropField, relationships: Relationships): any {
  switch (prop.kind) {
    case 'form':
      return prop.defaultValue;
    case 'child':
      return undefined;
    case 'relationship':
      return (relationships[prop.relationship] as Extract<Relationships[string], { kind: 'prop' }>)
        .many
        ? []
        : null;
    case 'conditional': {
      const defaultValue = prop.discriminant.defaultValue;
      return {
        discriminant: defaultValue,
        value: getInitialPropsValue(prop.values[defaultValue], relationships),
      };
    }
    case 'object': {
      let obj: Record<string, any> = {};
      Object.keys(prop.value).forEach(key => {
        obj[key] = getInitialPropsValue(prop.value[key], relationships);
      });
      return obj;
    }
  }
  assertNever(prop);
}
