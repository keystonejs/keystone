import { Element } from 'slate';
import { VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP } from './utils';
import { ComponentPropField, ComponentBlock } from '../../component-blocks';
import { Relationships } from '../relationship';
import { RelationshipValues, assertNever } from './utils';

export function insertInitialValues(
  blockProps: Record<string, any>,
  props: Record<string, ComponentPropField>,
  children: Element[],
  path: (string | number)[],
  relationshipValues: RelationshipValues,
  relationships: Relationships
) {
  Object.keys(props).forEach(key => {
    const val = props[key];
    if (val.kind === 'form') {
      blockProps[key] = val.defaultValue;
    } else if (val.kind === 'child') {
      if (val.options.kind === 'inline') {
        children.push({
          type: 'component-inline-prop',
          propPath: path.concat(key),
          children: [{ text: '' }],
        });
      } else if (val.options.kind === 'block') {
        children.push({
          type: 'component-block-prop',
          propPath: path.concat(key),
          children: [{ type: 'paragraph', children: [{ text: '' }] }],
        });
      } else {
        assertNever(val.options);
      }
    } else if (val.kind === 'object') {
      blockProps[key] = {};
      insertInitialValues(
        blockProps[key],
        val.value,
        children,
        path.concat(key),
        relationshipValues,
        relationships
      );
    } else if (val.kind === 'conditional') {
      blockProps[key] = {
        discriminant: val.discriminant.defaultValue,
      };
      insertInitialValues(
        blockProps[key],
        {
          value: (val.values as Record<string, ComponentPropField>)[val.discriminant.defaultValue],
        },
        children,
        path.concat(key),
        relationshipValues,
        relationships
      );
    } else if (val.kind === 'relationship') {
      relationshipValues[JSON.stringify(path.concat(key))] = {
        relationship: val.relationship,
        data: (relationships[val.relationship] as Extract<Relationships[string], { kind: 'prop' }>)
          .many
          ? []
          : null,
      };
    } else {
      assertNever(val);
    }
  });
}

export function getInitialValue(
  type: string,
  componentBlock: ComponentBlock,
  relationships: Relationships
) {
  const blockProps: Record<string, any> = {};
  const relationshipsValues: RelationshipValues = {};
  const children: Element[] = [];

  insertInitialValues(
    blockProps,
    componentBlock.props,
    children,
    [],
    relationshipsValues,
    relationships
  );
  const isFakeVoid = !children.length;
  if (isFakeVoid) {
    children.push({
      type: 'component-inline-prop',
      propPath: JSON.stringify([VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP]),
      children: [{ text: '' }],
    });
  }
  return {
    node: {
      type: 'component-block',
      component: type,
      props: blockProps,
      relationships: relationshipsValues,
      children,
    },
    isFakeVoid,
  };
}
