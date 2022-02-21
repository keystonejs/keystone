import { Element } from 'slate';
import { ReactElement } from 'react';
import { ComponentBlock } from '../../component-blocks';
import { Relationships } from '../relationship';
import { assertNever, getPropsForConditionalChange, PropPath } from './utils';
import { ComponentPropField } from './api';
import { getInitialPropsValue } from './initial-values';

function _getPreviewProps(
  prop: ComponentPropField,
  value: unknown,
  childrenByPath: Record<string, ReactElement>,
  path: PropPath,
  relationships: Relationships,
  onFormPropsChange: (formProps: Record<string, any>) => void
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
          }
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
          }
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
            }
          )
        ),
        insert() {
          onFormPropsChange([...arrayValue, getInitialPropsValue(prop.element, relationships)]);
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
  setNode: (props: Partial<Element & { type: 'component-block' }>) => void
) {
  return _getPreviewProps(
    { kind: 'object', value: componentBlock.props },
    element.props,
    childrenByPath,
    [],
    relationships,
    props => {
      setNode({ props });
    }
  );
}
