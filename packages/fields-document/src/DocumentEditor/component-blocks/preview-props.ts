import { Editor, Element, Transforms } from 'slate';
import { ReactElement } from 'react';
import { ReactEditor } from 'slate-react';
import { arrayMove } from '@dnd-kit/sortable';
import { ComponentBlock } from '../../component-blocks';
import { areArraysEqual } from '../document-features-normalization';
import { assert } from '../utils';
import {
  assertNever,
  findChildPropPathsForProp,
  getFieldAtPropPath,
  getPropsForConditionalChange,
  ReadonlyPropPath,
  transformProps,
} from './utils';
import {
  ArrayField,
  ComponentPropField,
  ConditionalField,
  FormField,
  PreviewProps,
  RelationshipField,
} from './api';
import { getInitialPropsValue, getInitialPropsValueFromInitializer } from './initial-values';

export const objectFieldSymbol = Symbol('object field');

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

type Common = {
  childrenByPath: Record<string, ReactElement>;
  onAddArrayItem: (path: ReadonlyPropPath) => void;
};

export function getPreviewPropsForProp(
  prop: ComponentPropField,
  value: unknown,
  path: ReadonlyPropPath,
  onFormPropsChange: (formProps: Record<string, any>) => void,
  common: Common
): any {
  switch (prop.kind) {
    case 'form':
      const props: PreviewProps<FormField<unknown, unknown>> = {
        value,
        onChange(newValue: any) {
          onFormPropsChange(newValue);
        },
        options: prop.options,
        field: prop,
      };
      return props;
    case 'child':
      return common.childrenByPath[JSON.stringify(path)];
    case 'object': {
      const previewProps: Record<string, any> = {
        [objectFieldSymbol]: prop,
      };
      Object.keys(prop.value).forEach(key => {
        previewProps[key] = getPreviewPropsForProp(
          prop.value[key],
          (value as any)[key],
          path.concat(key),
          newVal => {
            onFormPropsChange({ ...(value as any), [key]: newVal });
          },
          common
        );
      });
      return previewProps;
    }
    case 'relationship': {
      const props: PreviewProps<RelationshipField<boolean>> = {
        value: value as any,
        onChange(newValue: any) {
          onFormPropsChange(newValue);
        },
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
        onChange(newDiscriminant: any) {
          onFormPropsChange(
            getPropsForConditionalChange(
              { discriminant: newDiscriminant, value: conditionalValue.value },
              conditionalValue,
              prop
            )
          );
        },
        options: prop.discriminant.options,
        value: getPreviewPropsForProp(
          prop.values[conditionalValue.discriminant.toString()],
          conditionalValue.value,
          path.concat('value'),
          val => {
            onFormPropsChange({
              discriminant: conditionalValue.discriminant,
              value: val,
            });
          },
          common
        ),
        field: prop,
      };
      return props;
    }
    case 'array': {
      const keys = getElementIdsForArrayValue(value as any);
      const arrayValue = value as unknown[];
      const props: PreviewProps<ArrayField<ComponentPropField>> = {
        elements: arrayValue.map((val, i) => ({
          id: keys[i],
          element: getPreviewPropsForProp(
            prop.element,
            val,
            path.concat(i),
            val => {
              const newValue = [...(value as unknown[])];
              newValue[i] = val;
              setElementIdsForArrayValue(newValue, keys);
              onFormPropsChange(newValue);
            },
            common
          ),
        })),
        field: prop,
        onInsert(initial, index) {
          // onAddArrayItem(path);
          const newValue = [...(value as unknown[])];
          newValue.splice(
            index ?? newValue.length,
            0,
            getInitialPropsValueFromInitializer(prop.element, initial)
          );
          setElementIdsForArrayValue(newValue, [...keys, getNewArrayElementId()]);
          onFormPropsChange(newValue);
        },
        onMove(from, to) {
          const newValue = arrayMove(value as unknown[], from, to);
          setElementIdsForArrayValue(newValue, arrayMove(keys, from, to));
          onFormPropsChange(newValue);
        },
        onRemove(index) {
          const newValue = (value as unknown[]).filter((_, i) => i !== index);
          setElementIdsForArrayValue(
            newValue,
            keys.filter((_, i) => i !== index)
          );
          onFormPropsChange(newValue);
        },
      };
      return props;
    }
    default: {
      assertNever(prop);
    }
  }
}

export function createPreviewProps(
  element: Element & { type: 'component-block' },
  componentBlock: ComponentBlock,
  childrenByPath: Record<string, ReactElement>,
  setNode: (props: Partial<Element & { type: 'component-block' }>) => void,
  editor: Editor,
  elementToGetPropPath: Element & { type: 'component-block' }
) {
  return getPreviewPropsForProp(
    { kind: 'object', value: componentBlock.props },
    element.props,
    [],
    props => {
      setNode({ props });
    },
    {
      childrenByPath,
      onAddArrayItem: propPath =>
        onAddArrayItem(editor, propPath, element, elementToGetPropPath, componentBlock),
    }
  );
}

export function onAddArrayItem(
  editor: Editor,
  path: ReadonlyPropPath,
  element: Element & { type: 'component-block' },
  elementToGetPath: Element & { type: 'component-block' },
  componentBlock: ComponentBlock
) {
  Editor.withoutNormalizing(editor, () => {
    const arrayField = getFieldAtPropPath(path, element.props, componentBlock.props);
    assert(arrayField?.kind === 'array');
    const elementVal = getInitialPropsValue(arrayField.element);
    let nextIdx = 0;
    const newProps = transformProps(
      { kind: 'object', value: componentBlock.props },
      element.props,
      (prop, value, currentPath) => {
        if (prop.kind === 'array' && areArraysEqual(path, currentPath)) {
          nextIdx = (value as any[]).length;
          const newVal = [...(value as any[]), elementVal];
          setElementIdsForArrayValue(newVal, [
            ...getElementIdsForArrayValue(value as any[]),
            getNewArrayElementId(),
          ]);
          return newVal;
        }
        return value;
      }
    );
    const componentBlockPath = ReactEditor.findPath(editor, elementToGetPath);

    Transforms.setNodes(
      editor,
      { props: newProps as Record<string, unknown> },
      { at: componentBlockPath }
    );

    const propPathsToInsert = findChildPropPathsForProp(
      elementVal,
      arrayField.element,
      path.concat(nextIdx)
    );
    if (propPathsToInsert.length) {
      const hasEmptyThing =
        element.children.length === 1 &&
        element.children[0].type === 'component-inline-prop' &&
        element.children[0].propPath === undefined;
      if (hasEmptyThing) {
        Transforms.removeNodes(editor, { at: [...componentBlockPath, 0] });
      }
      for (const [idx, childFieldInfo] of propPathsToInsert.entries()) {
        Transforms.insertNodes(
          editor,
          {
            type: `component-${childFieldInfo.options.kind}-prop`,
            propPath: childFieldInfo.path,
            children: [{ text: '' }],
          },
          { at: [...componentBlockPath, (hasEmptyThing ? 0 : element.children.length) + idx] }
        );
      }
    }
  });
}
