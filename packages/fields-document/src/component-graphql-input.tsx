import { graphql } from '@keystone-6/core';
import { ComponentPropFieldForGraphQL } from './DocumentEditor/component-blocks/api';
import { getInitialPropsValue } from './DocumentEditor/component-blocks/initial-values';
import { assertNever } from './DocumentEditor/component-blocks/utils';

export function getGraphQLInputType(
  name: string,
  prop: ComponentPropFieldForGraphQL,
  operation: 'create' | 'update',
  cache: Map<ComponentPropFieldForGraphQL, graphql.InputType>
) {
  if (!cache.has(prop)) {
    const res = getGraphQLInputTypeInner(name, prop, operation, cache);
    cache.set(prop, res);
  }
  return cache.get(prop)!;
}

function getGraphQLInputTypeInner(
  name: string,
  prop: ComponentPropFieldForGraphQL,
  operation: 'create' | 'update',
  cache: Map<ComponentPropFieldForGraphQL, graphql.InputType>
): graphql.InputType {
  if (prop.kind === 'form') {
    return prop.graphql.input;
  }
  if (prop.kind === 'object') {
    return graphql.inputObject({
      name: `${name}${operation[0].toUpperCase()}${operation.slice(1)}Input`,
      fields: () =>
        Object.fromEntries(
          Object.entries(prop.value).map(([key, val]): [string, graphql.Arg<graphql.InputType>] => {
            const type = getGraphQLInputType(
              `${name}${key[0].toUpperCase()}${key.slice(1)}`,
              val,
              operation,
              cache
            );
            return [key, graphql.arg({ type })];
          })
        ),
    });
  }
  if (prop.kind === 'array') {
    const innerType = getGraphQLInputType(name, prop.element, operation, cache);
    return graphql.list(innerType);
  }
  if (prop.kind === 'conditional') {
    return graphql.inputObject({
      name: `${name}${operation[0].toUpperCase()}${operation.slice(1)}Input`,
      fields: () =>
        Object.fromEntries(
          Object.entries(prop.values).map(
            ([key, val]): [string, graphql.Arg<graphql.InputType>] => {
              const type = getGraphQLInputType(
                `${name}${key[0].toUpperCase()}${key.slice(1)}`,
                val,
                operation,
                cache
              );
              return [key, graphql.arg({ type })];
            }
          )
        ),
    });
  }

  assertNever(prop);
}

export function getValueForUpdate(
  prop: ComponentPropFieldForGraphQL,
  value: any,
  prevValue: any
): any {
  if (prevValue === undefined) {
    prevValue = getInitialPropsValue(prop);
  }
  if (value === undefined) {
    value = prevValue;
  }
  if (prop.kind === 'form') {
    if (prop.validate(value)) {
      return value;
    }
    throw new Error();
  }
  if (prop.kind === 'object') {
    if (value === null) {
      throw new Error();
    }
    return Object.fromEntries(
      Object.entries(prop.value).map(([key, val]) => {
        return [key, getValueForUpdate(val, value[key], prevValue[key])];
      })
    );
  }
  if (prop.kind === 'array') {
    if (value === null) {
      throw new Error();
    }

    return (value as any[]).map((val, i) => getValueForUpdate(prop.element, val, prevValue[i]));
  }
  if (prop.kind === 'relationship') {
    // TODO handle this case
  }
  if (prop.kind === 'conditional') {
    if (value === null) {
      throw new Error();
    }
    const conditionalValueKeys = Object.keys(value);
    if (conditionalValueKeys.length !== 1) {
      throw new Error();
    }
    const key = conditionalValueKeys[0];
    let discriminant: string | boolean = key;
    if ((key === 'true' || key === 'false') && !prop.discriminant.validate(key)) {
      discriminant = key === 'true';
    }
    return {
      discriminant,
      value: getValueForUpdate(
        (prop.values as any)[key],
        value[key],
        prevValue.discriminant === discriminant ? prevValue.value : getInitialPropsValue(prop)
      ),
    };
  }

  assertNever(prop);
}

export function getValueForCreate(prop: ComponentPropFieldForGraphQL, value: any): any {
  // If value is undefined, get the specified defaultValue
  if (value === undefined) {
    value = getInitialPropsValue(prop);
  }
  if (prop.kind === 'form') {
    if (prop.validate(value)) {
      return value;
    }
    throw new Error();
  }
  if (prop.kind === 'array') {
    if (value === null) {
      throw new Error();
    }
    return (value as any[]).map(val => getValueForCreate(prop.element, val));
  }
  if (prop.kind === 'object') {
    if (value === null) {
      throw new Error();
    }
    return Object.fromEntries(
      Object.entries(prop.value).map(([key, val]) => {
        return [key, getValueForCreate(val, value[key])];
      })
    );
  }
  if (prop.kind === 'conditional') {
    if (value === null) {
      throw new Error();
    }
    const conditionalValueKeys = Object.keys(value);
    if (conditionalValueKeys.length !== 1) {
      throw new Error();
    }
    const key = conditionalValueKeys[0];
    let discriminant: string | boolean = key;
    if ((key === 'true' || key === 'false') && !prop.discriminant.validate(key)) {
      discriminant = key === 'true';
    }

    return {
      discriminant,
      value: getValueForCreate((prop.values as any)[key], value[key]),
    };
  }

  assertNever(prop);
}
