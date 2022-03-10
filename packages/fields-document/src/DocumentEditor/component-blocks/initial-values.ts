import { ComponentPropField, ComponentBlock } from '../../component-blocks';
import {
  getElementIdsForArrayValue,
  getNewArrayElementId,
  setElementIdsForArrayValue,
} from './preview-props';
import { assertNever, findChildPropPaths } from './utils';

export function getInitialValue(type: string, componentBlock: ComponentBlock) {
  const props = getInitialPropsValue({ kind: 'object', value: componentBlock.props });
  return {
    type: 'component-block' as const,
    component: type,
    props,
    children: findChildPropPaths(props, componentBlock.props).map(x => ({
      type: `component-${x.options.kind}-prop` as const,
      propPath: x.path,
      children: [
        x.options.kind === 'block'
          ? { type: 'paragraph' as const, children: [{ text: '' }] }
          : { text: '' },
      ],
    })),
  };
}

export function getInitialPropsValue(prop: ComponentPropField): any {
  switch (prop.kind) {
    case 'form':
      return prop.defaultValue;
    case 'child':
      return null;
    case 'relationship':
      return prop.many ? [] : null;
    case 'conditional': {
      const defaultValue = prop.discriminant.defaultValue;
      return {
        discriminant: defaultValue,
        value: getInitialPropsValue(prop.values[defaultValue.toString()]),
      };
    }
    case 'object': {
      let obj: Record<string, any> = {};
      Object.keys(prop.value).forEach(key => {
        obj[key] = getInitialPropsValue(prop.value[key]);
      });
      return obj;
    }
    case 'array': {
      return [];
    }
  }
  assertNever(prop);
}

export function getInitialPropsValueFromInitializer(
  prop: ComponentPropField,
  initializer: any
): any {
  switch (prop.kind) {
    case 'form':
      return initializer === undefined ? prop.defaultValue : initializer;
    case 'child':
      return null;
    case 'relationship':
      return initializer === undefined ? (prop.many ? [] : null) : initializer;
    case 'conditional': {
      const defaultValue =
        initializer === undefined ? prop.discriminant.defaultValue : initializer.discriminant;
      return {
        discriminant: defaultValue,
        value: getInitialPropsValueFromInitializer(
          prop.values[defaultValue.toString()],
          initializer === undefined ? undefined : initializer.value
        ),
      };
    }
    case 'object': {
      let obj: Record<string, any> = {};
      Object.keys(prop.value).forEach(key => {
        obj[key] = getInitialPropsValueFromInitializer(
          prop.value[key],
          initializer === undefined ? undefined : initializer[key]
        );
      });
      return obj;
    }
    case 'array': {
      return ((initializer ?? []) as { value?: unknown }[]).map(x =>
        getInitialPropsValueFromInitializer(prop.element, x.value)
      );
    }
  }
  assertNever(prop);
}

export function updateValue(prop: ComponentPropField, currentValue: any, updater: any): any {
  if (updater === undefined) {
    return currentValue;
  }
  switch (prop.kind) {
    case 'relationship':
    case 'form':
      return updater;
    case 'child':
      return null;
    case 'conditional': {
      return {
        discriminant: updater.discriminant,
        value: updateValue(
          prop.values[updater.discriminant.toString()],
          currentValue.value,
          updater.value
        ),
      };
    }
    case 'object': {
      let obj: Record<string, any> = {};
      Object.keys(prop.value).forEach(key => {
        obj[key] = updateValue(prop.value[key], currentValue[key], updater[key]);
      });
      return obj;
    }
    case 'array': {
      const currentArrVal = currentValue as unknown[];
      const newVal = updater as { id: string | undefined; value: unknown }[];
      const uniqueKeys = new Set();
      for (const x of newVal) {
        if (x.id !== undefined) {
          if (uniqueKeys.has(x.id)) {
            throw new Error('Array elements must have unique ids');
          }
          uniqueKeys.add(x.id);
        }
      }
      const keys = newVal.map(x => {
        if (x.id !== undefined) {
          return x.id;
        }
        let elementId = getNewArrayElementId();
        // just in case someone gives an id that is above our counter
        while (uniqueKeys.has(elementId)) {
          elementId = getNewArrayElementId();
        }
        uniqueKeys.add(elementId);
        return elementId;
      });
      const prevKeys = getElementIdsForArrayValue(currentArrVal);
      const prevValuesByKey = new Map(
        currentArrVal.map((value, i) => {
          return [prevKeys[i], value];
        })
      );
      const val = newVal.map((x, i) => {
        const id = keys[i];
        const prevVal = prevValuesByKey.has(id)
          ? prevValuesByKey.get(id)
          : getInitialPropsValue(prop.element);
        return updateValue(prop.element, prevVal, x.value);
      });
      setElementIdsForArrayValue(val, keys);
      return val;
    }
  }
  assertNever(prop);
}
