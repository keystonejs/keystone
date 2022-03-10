import React, { ReactElement, useContext } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import weakMemoize from '@emotion/weak-memoize';
import {
  ArrayField,
  ComponentPropField,
  ConditionalField,
  FormField,
  FormFieldValue,
  ObjectField,
  PreviewProps,
  RelationshipField,
} from './api';
import { updateValue, getInitialPropsValueFromInitializer } from './initial-values';
import { assertNever } from './utils';

const arrayValuesToElementIds = new WeakMap<readonly unknown[], string[]>();

let counter = 0;

export function getElementIdsForArrayValue(value: readonly unknown[]) {
  if (!arrayValuesToElementIds.has(value)) {
    arrayValuesToElementIds.set(value, Array.from({ length: value.length }, getNewArrayElementId));
  }
  return arrayValuesToElementIds.get(value)!;
}

export function setElementIdsForArrayValue(value: unknown[], elementIds: string[]) {
  arrayValuesToElementIds.set(value, elementIds);
}

export function getNewArrayElementId() {
  return (counter++).toString();
}

export const ChildrenByPathContext = React.createContext<Record<string, ReactElement>>({});

function ChildFieldEditable({ path }: { path: readonly string[] }) {
  return useContext(ChildrenByPathContext)[JSON.stringify(path)];
}

export function createGetPreviewProps<Field extends ComponentPropField>(
  rootProp: Field,
  rootOnChange: (cb: (val: any) => any) => void
) {
  const innerOnChangeCacheForObjectAndArrayField = new WeakMap<
    (cb: (val: any) => any) => any,
    Map<string, (cb: (val: any) => any) => any>
  >();

  const onChangeCacheForObjectAndConditionalField = new WeakMap<
    (cb: (val: any) => any) => void,
    (...args: any[]) => void
  >();

  const onChangeCacheForArrayField = new WeakMap<
    (...args: any[]) => any,
    {
      readonly onChange: (value: any) => void;
      readonly onMove: (from: number, to: number) => void;
      readonly onInsert: (initial?: any, index?: number) => void;
      readonly onRemove: (index: number) => void;
    }
  >();

  const emptyMap = () => new Map<string, (cb: (val: any) => any) => void>();

  type GeneralMap<K, V> = {
    has(key: K): boolean;
    get(key: K): V | undefined;
    set(key: K, value: V): void;
  };

  function getOrInsert<K, V>(map: GeneralMap<K, V>, key: K, val: (key: K) => V): V {
    if (!map.has(key)) {
      map.set(key, val(key));
    }
    return map.get(key)!;
  }

  const makeOnChangeForFormAndRelationshipFields = weakMemoize(
    (onChange: (cb: (prevVal: any) => any) => void) => {
      return (newVal: FormFieldValue) => {
        onChange(() => newVal);
      };
    }
  );

  const makeOnChangeForValueOfConditionalField = weakMemoize(
    (onChange: (cb: (prevVal: any) => any) => void) => {
      return (val: (prevVal: any) => any) => {
        onChange(prev => ({
          discriminant: prev.discriminant,
          value: val(prev.value),
        }));
      };
    }
  );

  function getPreviewPropsForProp(
    prop: ComponentPropField,
    value: unknown,
    path: readonly string[],
    onChange: (cb: (prevVal: any) => any) => void,
    getInnerProp: (
      prop: ComponentPropField,
      value: unknown,
      path: readonly string[],
      onChange: (cb: (prevVal: any) => any) => void
    ) => any
  ): any {
    switch (prop.kind) {
      case 'form':
        const props: PreviewProps<FormField<FormFieldValue, unknown>> = {
          value: value as FormFieldValue,
          onChange: makeOnChangeForFormAndRelationshipFields(onChange),
          options: prop.options,
          field: prop,
        };
        return props;
      case 'child':
        return <ChildFieldEditable path={path} />;
      case 'object': {
        const fields: Record<string, any> = {};
        const onChangeCache = getOrInsert(
          innerOnChangeCacheForObjectAndArrayField,
          onChange,
          emptyMap
        );
        const getOnChange = (key: string) => {
          return (newVal: (prevVal: any) => any) => {
            onChange(val => ({ ...val, [key]: newVal(val[key]) }));
          };
        };
        Object.keys(prop.value).forEach(key => {
          const onChange = getOrInsert(onChangeCache, key, getOnChange);
          fields[key] = getInnerProp(
            prop.value[key],
            (value as any)[key],
            path.concat(key),
            onChange
          );
        });

        const previewProps: PreviewProps<ObjectField<Record<string, ComponentPropField>>> = {
          fields,
          onChange: getOrInsert(
            onChangeCacheForObjectAndConditionalField,
            onChange,
            () => updater => {
              onChange(value => updateValue(prop, value, updater));
            }
          ),
          field: prop,
        };
        return previewProps;
      }
      case 'relationship': {
        const props: PreviewProps<RelationshipField<boolean>> = {
          value: value as any,
          onChange: makeOnChangeForFormAndRelationshipFields(onChange),
          field: prop,
        };
        return props;
      }
      case 'conditional': {
        const conditionalValue = value as { discriminant: string | boolean; value: unknown };
        const props: PreviewProps<
          ConditionalField<
            FormField<string | boolean, unknown>,
            { [key: string]: ComponentPropField }
          >
        > = {
          discriminant: (value as any).discriminant,
          onChange: getOrInsert(
            onChangeCacheForObjectAndConditionalField,
            onChange,
            () => (discriminant, value) => {
              onChange(val => updateValue(prop, val, { discriminant, value }));
            }
          ),
          options: prop.discriminant.options,
          value: getInnerProp(
            prop.values[conditionalValue.discriminant.toString()],
            conditionalValue.value,
            path.concat('value'),
            makeOnChangeForValueOfConditionalField(onChange)
          ),
          field: prop,
        };
        return props;
      }
      case 'array': {
        const arrayValue = value as readonly unknown[];
        const keys = getElementIdsForArrayValue(arrayValue);

        const onChangeArrayItem = (key: string) => (val: (val: any) => any) => {
          onChange(prev => {
            const keys = getElementIdsForArrayValue(prev);
            const index = keys.indexOf(key);
            const newValue = [...prev];
            newValue[index] = val(newValue[index]);
            setElementIdsForArrayValue(newValue, keys);
            return newValue;
          });
        };
        const onChangeCache = getOrInsert(
          innerOnChangeCacheForObjectAndArrayField,
          onChange,
          emptyMap
        );
        const props: PreviewProps<ArrayField<ComponentPropField>> = {
          elements: arrayValue.map((val, i) => {
            const key = keys[i];

            return {
              id: keys[i],
              element: getInnerProp(
                prop.element,
                val,
                path.concat(key),
                getOrInsert(onChangeCache, key, onChangeArrayItem)
              ),
            };
          }),
          field: prop,
          ...getOrInsert(onChangeCacheForArrayField, onChange, () => ({
            onInsert(initial, index) {
              onChange(value => {
                const newValue = [...(value as unknown[])];

                newValue.splice(
                  index ?? newValue.length,
                  0,
                  getInitialPropsValueFromInitializer(prop.element, initial)
                );
                const keys = getElementIdsForArrayValue(value);
                setElementIdsForArrayValue(newValue, [...keys, getNewArrayElementId()]);
                return newValue;
              });
            },
            onMove(from, to) {
              onChange(value => {
                const newValue = arrayMove(value as unknown[], from, to);
                const keys = getElementIdsForArrayValue(value);
                setElementIdsForArrayValue(newValue, arrayMove(keys, from, to));
                return newValue;
              });
            },
            onChange(updater) {
              onChange(value => updateValue(prop, value, updater));
            },
            onRemove(index) {
              onChange(value => {
                const newValue = (value as unknown[]).filter((_, i) => i !== index);
                const keys = getElementIdsForArrayValue(value);
                setElementIdsForArrayValue(
                  newValue,
                  keys.filter((_, i) => i !== index)
                );
                return newValue;
              });
            },
          })),
        };
        return props;
      }
      default: {
        assertNever(prop);
      }
    }
  }
  function getInitialMemoState<Field extends ComponentPropField>(
    prop: Field,
    value: unknown,
    onChange: (cb: (val: unknown) => unknown) => void,
    path: readonly string[]
  ): MemoState<Field> {
    let innerState = new Map<string, MemoState<ComponentPropField>>();
    let state = {
      value,
      inner: innerState,
      props: getPreviewPropsForProp(prop, value, path, onChange, (prop, value, path, onChange) => {
        const state = getInitialMemoState(prop, value, onChange, path);
        const lastPathEntry = path[path.length - 1];
        innerState.set(lastPathEntry, state);
        return state.props;
      }),
    };
    return state;
  }
  function getUpToDateProps<Field extends ComponentPropField>(
    prop: Field,
    value: unknown,
    onChange: (cb: (val: unknown) => unknown) => void,
    memoState: MemoState<Field>,
    path: readonly string[]
  ): PreviewProps<Field> {
    if (memoState.value === value) {
      return memoState.props;
    }
    memoState.value = value;
    memoState.props = getPreviewPropsForProp(
      prop,
      value,
      path,
      onChange,
      (prop, value, path, onChange) => {
        const innerMemoStateKey = path[path.length - 1];
        if (!memoState.inner.has(innerMemoStateKey)) {
          const innerState = getInitialMemoState(prop, value, onChange, path);
          memoState.inner.set(innerMemoStateKey, innerState);
          return innerState.props;
        }
        return getUpToDateProps(
          prop,
          value,
          onChange,
          memoState.inner.get(innerMemoStateKey)!,
          path
        );
      }
    );
    return memoState.props;
  }
  let memoState: {
    props: PreviewProps<Field>;
    value: unknown;
    inner: Map<string, MemoState<ComponentPropField>>;
  };
  return (value: unknown): PreviewProps<Field> => {
    if (memoState === undefined) {
      memoState = getInitialMemoState(rootProp, value, rootOnChange, []);
      return memoState.props;
    }
    return getUpToDateProps(rootProp, value, rootOnChange, memoState, []);
  };
}

type MemoState<Field extends ComponentPropField> = {
  props: PreviewProps<Field>;
  value: unknown;
  inner: Map<string, MemoState<ComponentPropField>>;
};

// export function onAddArrayItem(
//   editor: Editor,
//   path: ReadonlyPropPath,
//   element: Element & { type: 'component-block' },
//   elementToGetPath: Element & { type: 'component-block' },
//   componentBlock: ComponentBlock
// ) {
//   Editor.withoutNormalizing(editor, () => {
//     const arrayField = getFieldAtPropPath(path, element.props, componentBlock.props);
//     assert(arrayField?.kind === 'array');
//     const elementVal = getInitialPropsValue(arrayField.element);
//     let nextIdx = 0;
//     const newProps = transformProps(
//       { kind: 'object', value: componentBlock.props },
//       element.props,
//       (prop, value, currentPath) => {
//         if (prop.kind === 'array' && areArraysEqual(path, currentPath)) {
//           nextIdx = (value as any[]).length;
//           const newVal = [...(value as any[]), elementVal];
//           setElementIdsForArrayValue(newVal, [
//             ...getElementIdsForArrayValue(value as any[]),
//             getNewArrayElementId(),
//           ]);
//           return newVal;
//         }
//         return value;
//       }
//     );
//     const componentBlockPath = ReactEditor.findPath(editor, elementToGetPath);

//     Transforms.setNodes(
//       editor,
//       { props: newProps as Record<string, unknown> },
//       { at: componentBlockPath }
//     );

//     const propPathsToInsert = findChildPropPathsForProp(
//       elementVal,
//       arrayField.element,
//       path.concat(nextIdx)
//     );
//     if (propPathsToInsert.length) {
//       const hasEmptyThing =
//         element.children.length === 1 &&
//         element.children[0].type === 'component-inline-prop' &&
//         element.children[0].propPath === undefined;
//       if (hasEmptyThing) {
//         Transforms.removeNodes(editor, { at: [...componentBlockPath, 0] });
//       }
//       for (const [idx, childFieldInfo] of propPathsToInsert.entries()) {
//         Transforms.insertNodes(
//           editor,
//           {
//             type: `component-${childFieldInfo.options.kind}-prop`,
//             propPath: childFieldInfo.path,
//             children: [{ text: '' }],
//           },
//           { at: [...componentBlockPath, (hasEmptyThing ? 0 : element.children.length) + idx] }
//         );
//       }
//     }
//   });
// }
