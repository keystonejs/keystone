import { JSONValue } from '@keystone-next/types';
import { GraphQLError } from 'graphql';

type Path = (string | number)[];

export type DeepNullable<T> =
  | null
  | (T extends Array<infer Item>
      ? Array<DeepNullable<Item>>
      : { [Key in keyof T]: DeepNullable<T[Key]> });

export type DataGetter<Value> = {
  readonly data: Value;
  readonly errors?: readonly [GraphQLError, ...GraphQLError[]];
  readonly path: (string | number)[];
  get<
    Key extends NonNullable<Value> extends Array<any>
      ? number
      : Exclude<keyof NonNullable<Value>, symbol>
  >(
    field: Key
  ): DataGetter<(Key extends keyof NonNullable<Value> ? NonNullable<Value>[Key] : never) | null>;
};

function dataGetterWithNoErrors(data: any, path: Path): DataGetter<any> {
  return {
    data,
    path,
    get(field) {
      return dataGetterWithNoErrors(data?.[field] ?? null, path.concat(field));
    },
  };
}

function dataGetterWithErrors(
  data: any,
  errors: readonly [GraphQLError, ...GraphQLError[]],
  path: Path
): DataGetter<any> {
  return {
    data,
    errors,
    path,
    get(field) {
      const newPath = path.concat(field);
      const newItem = data?.[field] ?? null;
      let errorsForField = errors.filter(error => {
        if (error.path === undefined) {
          return true;
        }
        const errorPath = error.path;
        return newPath.every(
          (value, index) => errorPath[index] === undefined || errorPath[index] === value
        );
      });
      if (errorsForField.length) {
        return dataGetterWithErrors(newItem, errors, newPath);
      }
      return dataGetterWithNoErrors(newItem, newPath);
    },
  };
}

export function makeDataGetter<Data extends JSONValue>(
  data: Data,
  errors: readonly GraphQLError[] | undefined
): DataGetter<Data> {
  if (errors?.length) {
    return dataGetterWithErrors(data, errors as readonly [GraphQLError, ...GraphQLError[]], []);
  }
  return dataGetterWithNoErrors(data, []);
}
