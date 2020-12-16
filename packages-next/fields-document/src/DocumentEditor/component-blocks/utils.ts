import { Element } from 'slate';
import { ComponentPropField, ConditionalField, RelationshipData } from '../../component-blocks';
import { Relationships } from '../relationship';
import { insertInitialValues } from './initial-values';

function _findChildPropPaths(
  value: Record<string, any>,
  props: Record<string, ComponentPropField>,
  path: (string | number)[]
) {
  let paths: { path: (string | number)[]; kind: 'block' | 'inline' }[] = [];
  Object.keys(props).forEach(key => {
    const val = props[key];
    if (val.kind === 'form' || val.kind === 'relationship') {
    } else if (val.kind === 'child') {
      paths.push({ path: path.concat(key), kind: val.options.kind });
    } else if (val.kind === 'object') {
      paths.push(..._findChildPropPaths(value[key], val.value, path.concat(key)));
    } else if (val.kind === 'conditional') {
      paths.push(
        ..._findChildPropPaths(
          value[key],
          { value: val.values[value[key].discriminant] },
          path.concat(key)
        )
      );
    } else {
      assertNever(val);
    }
  });
  return paths;
}

export function findChildPropPaths(
  value: Record<string, any>,
  props: Record<string, ComponentPropField>
): { path: (string | number)[]; kind: 'inline' | 'block' }[] {
  let propPaths = _findChildPropPaths(value, props, []);
  if (!propPaths.length) {
    return [{ path: [VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP], kind: 'inline' }];
  }
  return propPaths;
}

export const VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP =
  '________VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP________';

export function assertNever(arg: never) {
  throw new Error('expected to never be called but recieved: ' + JSON.stringify(arg));
}

export type RelationshipValues = Record<
  string,
  {
    relationship: string;
    data: RelationshipData | readonly RelationshipData[] | null;
  }
>;

export function onConditionalChange(
  newValue: Record<string, any>,
  oldValue: Record<string, any>,
  path: (number | string)[],
  relationshipValues: RelationshipValues,
  relationships: Relationships,
  onRelationshipValuesChange: (relationshipValues: RelationshipValues) => void,
  onChange: (formProps: Record<string, any>) => void,
  prop: ConditionalField<any, any, any>
) {
  if (newValue.discriminant !== oldValue.discriminant) {
    // we need to remove relationships that existed in the previous discriminant
    const filteredRelationshipValues: RelationshipValues = {};
    const pathToMatch = JSON.stringify(path.concat('value')).replace(/\]$/, '');
    Object.keys(relationshipValues).forEach(relationshipPath => {
      if (!relationshipPath.startsWith(pathToMatch)) {
        filteredRelationshipValues[relationshipPath] = relationshipValues[relationshipPath];
      }
    });

    let blockProps: any = {};

    // we're not gonna do anything with this, normalizeNode will fix it
    let children: Element[] = [];

    insertInitialValues(
      blockProps,
      { value: prop.values[newValue.discriminant] },
      children,
      path,
      filteredRelationshipValues,
      relationships
    );

    onRelationshipValuesChange(filteredRelationshipValues);

    onChange({
      discriminant: newValue.discriminant,
      value: blockProps.value,
    });
  } else {
    onChange(newValue);
  }
}
