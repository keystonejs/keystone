import { Editor, Element, Transforms } from 'slate';
import { ReactElement } from 'react';
import { ReactEditor } from 'slate-react';
import { ComponentBlock } from '../../component-blocks';
import { Relationships } from '../relationship';
import { areArraysEqual } from '../document-features-normalization';
import { assert } from '../utils';
import {
  assertNever,
  findChildPropPathsForProp,
  getFieldAtPropPath,
  getPropsForConditionalChange,
  PropPath,
  ReadonlyPropPath,
  transformProps,
} from './utils';
import { ComponentPropField } from './api';
import { getInitialPropsValue } from './initial-values';

function _getPreviewProps(
  prop: ComponentPropField,
  value: unknown,
  childrenByPath: Record<string, ReactElement>,
  path: PropPath,
  relationships: Relationships,
  onFormPropsChange: (formProps: Record<string, any>) => void,
  onAddArrayItem: (path: ReadonlyPropPath) => void
): any {
  switch (prop.kind) {
    case 'form':
      return {
        value,
        onChange(newValue: any) {
          onFormPropsChange(newValue);
        },
        options: prop.options,
      };
    case 'child':
      return childrenByPath[JSON.stringify(path)];
    case 'object': {
      const previewProps: Record<string, any> = {};
      Object.keys(prop.value).forEach(key => {
        previewProps[key] = _getPreviewProps(
          prop.value[key],
          (value as any)[key],
          childrenByPath,
          path.concat(key),
          relationships,
          newVal => {
            onFormPropsChange({ ...(value as any), [key]: newVal });
          },
          onAddArrayItem
        );
      });
      return previewProps;
    }
    case 'relationship': {
      return {
        value,
        onChange(newValue: any) {
          onFormPropsChange(newValue);
        },
      };
    }
    case 'conditional': {
      const conditionalValue = value as { discriminant: string | boolean; value: unknown };
      return {
        discriminant: (value as any).discriminant,
        onChange(newDiscriminant: any) {
          onFormPropsChange(
            getPropsForConditionalChange(
              { discriminant: newDiscriminant, value: conditionalValue.value },
              conditionalValue,
              prop,
              relationships
            )
          );
        },
        options: prop.discriminant.options,
        value: _getPreviewProps(
          prop.values[conditionalValue.discriminant.toString()],
          conditionalValue.value,
          childrenByPath,
          path.concat('value'),
          relationships,
          val => {
            onFormPropsChange({
              discriminant: conditionalValue.discriminant,
              value: val,
            });
          },
          onAddArrayItem
        ),
      };
    }
    case 'array': {
      const arrayValue = value as unknown[];
      return {
        elements: arrayValue.map((val, i) =>
          _getPreviewProps(
            prop.element,
            val,
            childrenByPath,
            path.concat(i),
            relationships,
            val => {
              const newValue = [...(value as unknown[])];
              newValue[i] = val;
              onFormPropsChange(newValue);
            },
            onAddArrayItem
          )
        ),
        insert() {
          onAddArrayItem(path);
        },
      };
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
  relationships: Relationships,
  setNode: (props: Partial<Element & { type: 'component-block' }>) => void,
  editor: Editor,
  elementToGetPropPath: Element & { type: 'component-block' }
) {
  return _getPreviewProps(
    { kind: 'object', value: componentBlock.props },
    element.props,
    childrenByPath,
    [],
    relationships,
    props => {
      setNode({ props });
    },
    propPath =>
      onAddArrayItem(editor, propPath, element, elementToGetPropPath, componentBlock, relationships)
  );
}

function onAddArrayItem(
  editor: Editor,
  path: ReadonlyPropPath,
  element: Element & { type: 'component-block' },
  elementToGetPath: Element & { type: 'component-block' },
  componentBlock: ComponentBlock,
  relationships: Relationships
) {
  Editor.withoutNormalizing(editor, () => {
    const arrayField = getFieldAtPropPath(path, element.props, componentBlock.props);
    assert(arrayField?.kind === 'array');
    const elementVal = getInitialPropsValue(arrayField.element, relationships);
    let nextIdx = 0;
    const newProps = transformProps(
      { kind: 'object', value: componentBlock.props },
      element.props,
      (prop, value, currentPath) => {
        if (prop.kind === 'array' && areArraysEqual(path, currentPath)) {
          nextIdx = (value as any[]).length;
          return [...(value as any[]), elementVal];
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
      console.log(propPathsToInsert);
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
    console.log('before normalization', editor.children);
  });
  console.log('after normalization', editor.children);
}
