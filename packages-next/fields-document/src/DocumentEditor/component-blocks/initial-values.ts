import { ComponentPropField, ComponentBlock } from '../../component-blocks';
import { Relationships } from '../relationship';
import { assertNever } from './utils';

export function getInitialValue(
  type: string,
  componentBlock: ComponentBlock,
  relationships: Relationships
) {
  return {
    type: 'component-block',
    component: type,
    props: getInitialPropsValue({ kind: 'object', value: componentBlock.props }, relationships),
    children: [{ text: '' }],
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
