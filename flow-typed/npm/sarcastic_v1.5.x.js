// flow-typed signature: 15a2b719a9b43541e3723f51ab6dffdf
// flow-typed version: sarcastic_v1.5.0/flow_v0.110.0

declare module 'sarcastic' {
  declare type Name = string | (...keyPath: Array<string | number>) => string;
  declare type Assertion<T> = (val: mixed, name: Name) => T;
  declare type AssertionMap = { [key: string]: Assertion<any> };
  declare type ExtractAssertionType = <T>(Assertion<T>) => T;
  declare type AssertionResultMap<T> = $ObjMap<T, ExtractAssertionType>;

  declare class AssertionError extends Error {
    kind: string;
    target: string;
    value: mixed;
  }


  declare module.exports: {
    is: <T>(val: mixed, assertion: Assertion<T>, name?: Name) => T,
    boolean: Assertion<boolean>,
    number: Assertion<number>,
    string: Assertion<string>,
    array: Assertion<$ReadOnlyArray<mixed>>,
    func: Assertion<Function>,
    object: Assertion<{ [key: string]: mixed }>,
    arrayOf: <T>(assertion: Assertion<T>) => Assertion<Array<T>>,
    arrayish: <T>(assertion: Assertion<T>) => Assertion<Array<T>>,
    objectOf: <T>(assertion: Assertion<T>) => Assertion<{ [key: string]: T }>,
    shape: <T: AssertionMap>(assertions: T) => Assertion<AssertionResultMap<T>>,
    maybe: <T>(assertion: Assertion<T>) => Assertion<T | null>,
    default: <T>(assertion: Assertion<T>, defaultValue: T) => Assertion<T>,
    either: <A, B>(assertionA: Assertion<A>, assertionB: Assertion<B>) => Assertion<A | B>,
    AssertionError: AssertionError,
    <T>(val: mixed, assertion: Assertion<T>, name?: Name): T,
  };
}
