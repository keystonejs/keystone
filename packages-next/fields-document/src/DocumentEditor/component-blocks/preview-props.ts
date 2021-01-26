import { Element } from 'slate';
import { ReactElement } from 'react';
import { ComponentBlock } from '../../component-blocks';
import { Relationships } from '../relationship';
import { getPropsForConditionalChange } from './utils';
import { ComponentPropField } from './api';

function _getPreviewProps(
  prop: ComponentPropField,
  value: Record<string, any>,
  childrenByPath: Record<string, ReactElement>,
  path: (string | number)[],
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
          value[key],
          childrenByPath,
          path.concat(key),
          relationships,
          newVal => {
            onFormPropsChange({ ...value, [key]: newVal });
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
      return {
        discriminant: value.discriminant,
        onChange(newDiscriminant: any) {
          onFormPropsChange(
            getPropsForConditionalChange(
              { discriminant: newDiscriminant, value: value.value },
              value,
              prop,
              relationships
            )
          );
        },
        options: prop.discriminant.options,
        value: _getPreviewProps(
          prop.values[value.discriminant],
          value.value,
          childrenByPath,
          path.concat('value'),
          relationships,
          val => {
            onFormPropsChange({
              discriminant: value.discriminant,
              value: val,
            });
          }
        ),
      };
    }
  }
}

export function createPreviewProps(
  element: Element,
  componentBlock: ComponentBlock,
  childrenByPath: Record<string, ReactElement>,
  relationships: Relationships,
  setNode: (props: Partial<Element>) => void
) {
  return _getPreviewProps(
    { kind: 'object', value: componentBlock.props },
    element.props as any,
    childrenByPath,
    [],
    relationships,
    props => {
      setNode({ props });
    }
  );
}
