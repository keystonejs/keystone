import React, { ReactElement, useContext } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import {
  ArrayField,
  ComponentPropField,
  ConditionalField,
  ValueForComponentPropField,
  FormField,
  FormFieldValue,
  HydratedRelationshipData,
  ObjectField,
  PreviewProps,
  RelationshipField,
} from './api';
import { updateValue, getInitialPropsValueFromInitializer } from './initial-values';

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

export function ChildFieldEditable({ path }: { path: readonly string[] }) {
  const childrenByPath = useContext(ChildrenByPathContext);
  const child = childrenByPath[JSON.stringify(path)];
  if (child === undefined) {
    return null;
  }
  return child;
}

function castToMemoizedInfoForProp<
  T extends {
    [Kind in ComponentPropField['kind']]: (
      prop: Extract<ComponentPropField, { kind: Kind }>,
      onChange: (
        cb: (
          prevVal: ValueForComponentPropField<Extract<ComponentPropField, { kind: Kind }>>
        ) => ValueForComponentPropField<Extract<ComponentPropField, { kind: Kind }>>
      ) => void
    ) => unknown;
  }
>(val: T): T {
  return val;
}

const memoizedInfoForProp = castToMemoizedInfoForProp({
  form(prop, onChange) {
    return (newVal: unknown) => onChange(() => newVal);
  },
  array(prop, onChange) {
    return {
      rawOnChange: onChange,
      inner: new Map<
        string,
        {
          onChange: (cb: (val: unknown) => unknown) => void;
          inner: { id: string; element: unknown };
        }
      >(),
      props: {
        onInsert(initial?: unknown, index?: number) {
          onChange(value => {
            const newValue = [...(value as unknown[])];

            newValue.splice(
              index ?? newValue.length,
              0,
              getInitialPropsValueFromInitializer(prop.element, initial)
            );
            const keys = getElementIdsForArrayValue(value as readonly unknown[]);
            setElementIdsForArrayValue(newValue, [...keys, getNewArrayElementId()]);
            return newValue;
          });
        },
        onMove(from: number, to: number) {
          onChange(value => {
            const newValue = arrayMove(value as unknown[], from, to);
            const keys = getElementIdsForArrayValue(value as readonly unknown[]);
            setElementIdsForArrayValue(newValue, arrayMove(keys, from, to));
            return newValue;
          });
        },
        onChange(updater: readonly { id?: string; value?: unknown }[]) {
          onChange(value => updateValue(prop, value, updater));
        },
        onRemove(index: number) {
          onChange(value => {
            const newValue = (value as unknown[]).filter((_, i) => i !== index);
            const keys = getElementIdsForArrayValue(value as readonly unknown[]);
            setElementIdsForArrayValue(
              newValue,
              keys.filter((_, i) => i !== index)
            );
            return newValue;
          });
        },
      },
    };
  },
  child() {},
  conditional(prop, onChange) {
    return {
      onChange: (discriminant: string | boolean, value?: unknown) =>
        onChange(val => updateValue(prop, val, { discriminant, value })),
      onChangeForValue: (cb: (prevVal: unknown) => unknown) =>
        onChange(val => ({ discriminant: val.discriminant, value: cb(val.value) })),
    };
  },
  object(prop, onChange) {
    return {
      onChange: (updater: Record<string, unknown>) => {
        onChange(value => updateValue(prop, value, updater));
      },
      innerOnChanges: Object.fromEntries(
        Object.keys(prop.value).map(key => {
          return [
            key,
            (newVal: (prevVal: unknown) => unknown) => {
              onChange(val => ({ ...(val as any), [key]: newVal((val as any)[key]) }));
            },
          ];
        })
      ),
    };
  },
  relationship(prop, onChange) {
    return (newVal: HydratedRelationshipData | readonly HydratedRelationshipData[] | null) =>
      onChange(() => newVal);
  },
});

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

export function createGetPreviewProps<Field extends ComponentPropField>(
  rootProp: Field,
  rootOnChange: (
    cb: (val: ValueForComponentPropField<Field>) => ValueForComponentPropField<Field>
  ) => void
) {
  const previewPropsFactories: {
    [Kind in ComponentPropField['kind']]: (
      prop: Extract<ComponentPropField, { kind: Kind }>,
      value: ValueForComponentPropField<Extract<ComponentPropField, { kind: Kind }>>,
      memoized: ReturnType<typeof memoizedInfoForProp[Kind]>,
      path: readonly string[],
      getInnerProp: <Field extends ComponentPropField>(
        prop: Field,
        value: ValueForComponentPropField<Field>,
        onChange: (
          cb: (prevVal: ValueForComponentPropField<Field>) => ValueForComponentPropField<Field>
        ) => void,
        key: string
      ) => PreviewProps<Field>
    ) => PreviewProps<Extract<ComponentPropField, { kind: Kind }>>;
  } = {
    form(prop, value, onChange) {
      return {
        value: value as FormFieldValue,
        onChange,
        options: prop.options,
        field: prop,
      };
    },
    child(prop, value, onChange, path) {
      return <ChildFieldEditable path={path} />;
    },
    object(prop, value, memoized, path, getInnerProp) {
      const fields: Record<string, PreviewProps<ComponentPropField>> = {};

      Object.keys(prop.value).forEach(key => {
        fields[key] = getInnerProp(
          prop.value[key],
          (value as any)[key],
          memoized.innerOnChanges[key],
          key
        );
      });

      const previewProps: PreviewProps<ObjectField<Record<string, ComponentPropField>>> = {
        fields,
        onChange: memoized.onChange,
        field: prop,
      };
      return previewProps;
    },
    array(prop, value, memoized, path, getInnerProp) {
      const arrayValue = value as readonly unknown[];
      const keys = getElementIdsForArrayValue(arrayValue);

      const unusedKeys = new Set(getElementIdsForArrayValue(value));

      const props: PreviewProps<ArrayField<ComponentPropField>> = {
        elements: arrayValue.map((val, i) => {
          const key = keys[i];
          unusedKeys.delete(key);
          const element = getOrInsert(memoized.inner, key, () => {
            const onChange = (val: (val: unknown) => unknown) => {
              memoized.rawOnChange(prev => {
                const keys = getElementIdsForArrayValue(prev as readonly unknown[]);
                const index = keys.indexOf(key);
                const newValue = [...(prev as readonly unknown[])];
                newValue[index] = val(newValue[index]);
                setElementIdsForArrayValue(newValue, keys);
                return newValue;
              });
            };
            return {
              inner: {
                element: getInnerProp(prop.element, val, onChange, key),
                id: key,
              },
              onChange,
            };
          });
          const currentInnerProp = getInnerProp(prop.element, val, element.onChange, key);
          if (element.inner.element !== currentInnerProp) {
            element.inner = {
              element: currentInnerProp,
              id: key,
            };
          }
          return element.inner as { id: string; element: typeof currentInnerProp };
        }),
        field: prop,
        ...memoized.props,
      };
      for (const key of unusedKeys) {
        memoized.inner.delete(key);
      }
      return props;
    },
    relationship(prop, value, onChange) {
      const props: PreviewProps<RelationshipField<boolean>> = {
        value: value,
        onChange,
        field: prop,
      };
      return props;
    },
    conditional(prop, value, memoized, path, getInnerProp) {
      const props: PreviewProps<
        ConditionalField<
          FormField<string | boolean, unknown>,
          { [key: string]: ComponentPropField }
        >
      > = {
        discriminant: value.discriminant as any,
        onChange: memoized.onChange,
        options: prop.discriminant.options,
        value: getInnerProp(
          prop.values[value.discriminant.toString()],
          value.value,
          memoized.onChangeForValue,
          'value'
        ),
        field: prop,
      };
      return props;
    },
  };

  function getPreviewPropsForProp<Field extends ComponentPropField>(
    prop: Field,
    value: unknown,
    memoedThing: { __memoizedThing: true },
    path: readonly string[],
    getInnerProp: <Field extends ComponentPropField>(
      prop: Field,
      value: ValueForComponentPropField<Field>,
      onChange: (
        cb: (prevVal: ValueForComponentPropField<Field>) => ValueForComponentPropField<Field>
      ) => void,
      key: string
    ) => PreviewProps<Field>
  ): PreviewProps<Field> {
    return previewPropsFactories[prop.kind](
      prop as any,
      value as any,
      memoedThing as any,
      path,
      getInnerProp
    ) as any;
  }

  function getInitialMemoState<Field extends ComponentPropField>(
    prop: Field,
    value: ValueForComponentPropField<Field>,
    onChange: (
      cb: (val: ValueForComponentPropField<Field>) => ValueForComponentPropField<Field>
    ) => void,
    path: readonly string[]
  ): MemoState<Field> {
    let innerState = new Map<string, MemoState<ComponentPropField>>();
    const blah = (
      memoizedInfoForProp[prop.kind] as (
        prop: ComponentPropField,
        onChange: (
          cb: (val: ValueForComponentPropField<Field>) => ValueForComponentPropField<Field>
        ) => void
      ) => any
    )(prop, onChange);
    let state: MemoState<ComponentPropField> = {
      value,
      inner: innerState,
      props: getPreviewPropsForProp(prop, value, blah, path, (prop, value, onChange, key) => {
        const state = getInitialMemoState(prop, value, onChange, path.concat(key));
        innerState.set(key, state);
        return state.props;
      }),
      field: prop,
      cached: blah,
    };
    return state as MemoState<Field>;
  }
  function getUpToDateProps<Field extends ComponentPropField>(
    prop: Field,
    value: ValueForComponentPropField<Field>,
    onChange: (
      cb: (val: ValueForComponentPropField<Field>) => ValueForComponentPropField<Field>
    ) => void,
    memoState: MemoState<Field>,
    path: readonly string[]
  ): PreviewProps<Field> {
    if (memoState.field !== prop) {
      Object.assign(memoState, getInitialMemoState(prop, value, onChange, path));
      return memoState.props;
    }
    if (memoState.value === value) {
      return memoState.props;
    }
    memoState.value = value;
    const unusedKeys = new Set(memoState.inner.keys());
    memoState.props = getPreviewPropsForProp(
      prop,
      value,
      memoState.cached as any,
      path,
      (prop, value, onChange, innerMemoStateKey) => {
        unusedKeys.delete(innerMemoStateKey);
        if (!memoState.inner.has(innerMemoStateKey)) {
          const innerState = getInitialMemoState(
            prop,
            value,
            onChange,
            path.concat(innerMemoStateKey)
          );
          memoState.inner.set(innerMemoStateKey, innerState);
          return innerState.props;
        }
        return getUpToDateProps<typeof prop>(
          prop,
          value,
          onChange,
          memoState.inner.get(innerMemoStateKey) as MemoState<typeof prop>,
          path.concat(innerMemoStateKey)
        );
      }
    );
    for (const key of unusedKeys) {
      memoState.inner.delete(key);
    }
    return memoState.props;
  }
  let memoState: MemoState<Field>;
  return (value: ValueForComponentPropField<Field>): PreviewProps<Field> => {
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
  field: Field;
  cached: ReturnType<typeof memoizedInfoForProp[Field['kind']]>;
  inner: Map<string, MemoState<ComponentPropField>>;
};
