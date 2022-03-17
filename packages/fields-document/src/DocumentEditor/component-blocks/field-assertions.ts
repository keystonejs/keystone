import { ComponentPropField } from './api';
import { assertNever } from './utils';

export function assertValidComponentPropField(
  prop: ComponentPropField,
  lists: ReadonlySet<string>
) {
  assertValidComponentPropFieldInner(prop, [], [], new Set(), lists);
}

// recursive things can exist but they have to either be:
// - inside the non-default portion of a conditional field
// - inside an array field
// when we hit the non-default portion of a conditional field or an array field
// checking inside of it essentially means pretend it's a new thing
function assertValidComponentPropFieldInner(
  prop: ComponentPropField,
  propAncestors: ComponentPropField[],
  propPath: string[],
  seenProps: Set<ComponentPropField>,
  lists: ReadonlySet<string>
) {
  if (prop.kind === 'form' || prop.kind === 'child') {
    return;
  }
  if (prop.kind === 'relationship') {
    if (lists.has(prop.listKey)) {
      return;
    }
    throw new Error(
      `The relationship field at "${propPath.join('.')}"  has the listKey "${
        prop.listKey
      }" but no list named "${prop.listKey}" exists.`
    );
  }
  const ancestor = propAncestors.indexOf(prop);
  if (ancestor !== -1) {
    throw new Error(
      `The field at "${propPath.join(
        '.'
      )}" is a field that is also its ancestor, this is not allowed because it would create an infinitely recursive structure. Introduce an array or conditional field to represent recursive structure.`
    );
  }
  if (seenProps.has(prop)) {
    return;
  }
  propPath.push(prop.kind);
  try {
    seenProps.add(prop);
    if (prop.kind === 'array') {
      assertValidComponentPropFieldInner(prop.element, [], propPath, seenProps, lists);
      return;
    }
    if (prop.kind === 'object') {
      propAncestors.push(prop);
      for (const [key, innerProp] of Object.entries(prop.value)) {
        propPath.push(key);
        if (prop.value[key] !== innerProp) {
          throw new Error(
            `Fields on an object field must not change over time but the field at "${propPath.join(
              '.'
            )}" changes between accesses`
          );
        }
        assertValidComponentPropFieldInner(innerProp, propAncestors, propPath, seenProps, lists);
        propPath.pop();
      }
      propAncestors.pop();
      return;
    }
    if (prop.kind === 'conditional') {
      propAncestors.push(prop);
      const stringifiedDefaultDiscriminant = prop.discriminant.defaultValue.toString();
      for (const [key, innerProp] of Object.entries(prop.values)) {
        propPath.push(key);
        if (prop.values[key] !== innerProp) {
          throw new Error(
            `Fields on a conditional field must not change over time but the field at "${propPath.join(
              '.'
            )}" changes between accesses`
          );
        }
        assertValidComponentPropFieldInner(
          innerProp,
          key === stringifiedDefaultDiscriminant ? propAncestors : [],
          propPath,
          seenProps,
          lists
        );
        propPath.pop();
      }
      propAncestors.pop();
      return;
    }
  } finally {
    propPath.pop();
  }
  assertNever(prop);
}
