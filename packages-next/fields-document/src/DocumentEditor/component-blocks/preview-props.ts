import { Element } from 'slate';
import { ReactElement } from 'react';
import { ComponentBlock, RelationshipData } from '../../component-blocks';
import { Relationships } from '../relationship';
import { assertNever, onConditionalChange, RelationshipValues } from './utils';

function _buildPreviewProps(
  previewProps: Record<string, any>,
  props: ComponentBlock['props'],
  formProps: Record<string, any>,
  childrenByPath: Record<string, ReactElement>,
  path: (string | number)[],
  relationshipValues: RelationshipValues,
  relationships: Relationships,
  // TODO: ~~maybe replace these with things that do batching so if you set two props in succession, they'll both be applied~~
  // The better solution would be to allow changing multiple props at the same time rather than one at a time
  onRelationshipValuesChange: (relationshipValues: RelationshipValues) => void,
  onFormPropsChange: (formProps: Record<string, any>) => void
) {
  Object.keys(props).forEach(key => {
    const val = props[key];
    if (val.kind === 'form') {
      previewProps[key] = {
        value: formProps[key],
        onChange(value: any) {
          onFormPropsChange({ ...formProps, [key]: value });
        },
        options: val.options,
      };
    } else if (val.kind === 'child') {
      previewProps[key] = childrenByPath[JSON.stringify(path.concat(key))];
    } else if (val.kind === 'object') {
      previewProps[key] = {};
      _buildPreviewProps(
        previewProps[key],
        val.value,
        formProps[key],
        childrenByPath,
        path.concat(key),
        relationshipValues,
        relationships,
        onRelationshipValuesChange,
        value => {
          onFormPropsChange({ ...formProps, [key]: value });
        }
      );
    } else if (val.kind === 'conditional') {
      const newPath = path.concat(key);
      previewProps[key] = {
        discriminant: formProps[key].discriminant,
        options: val.discriminant.options,
        onChange(newDiscriminant: any) {
          onConditionalChange(
            { ...formProps[key], discriminant: newDiscriminant },
            formProps[key],
            newPath,
            relationshipValues,
            relationships,
            onRelationshipValuesChange,
            value => {
              onFormPropsChange({ ...formProps, [key]: value });
            },
            val
          );
        },
      };
      _buildPreviewProps(
        previewProps[key],
        {
          value: val.values[formProps[key].discriminant],
        },
        formProps[key],
        childrenByPath,
        newPath,
        relationshipValues,
        relationships,
        onRelationshipValuesChange,
        value => {
          onFormPropsChange({ ...formProps, [key]: value });
        }
      );
    } else if (val.kind === 'relationship') {
      const relationshipPath = JSON.stringify(path.concat(key));
      const relationshipValue = relationshipValues[relationshipPath];
      previewProps[key] = {
        value: relationshipValue.data,
        onChange(value: RelationshipData | readonly RelationshipData[] | null) {
          onRelationshipValuesChange({
            ...relationshipValues,
            [relationshipPath]: {
              relationship: relationshipValue.relationship,
              data: value,
            },
          });
        },
      };
    } else {
      assertNever(val);
    }
  });
}

export function createPreviewProps(
  element: Element,
  componentBlock: ComponentBlock,
  childrenByPath: Record<string, ReactElement>,
  relationships: Relationships,
  setNode: (element: Partial<Element>) => void
) {
  const previewProps = {};
  _buildPreviewProps(
    previewProps,
    componentBlock.props,
    element.props as any,
    childrenByPath,
    [],
    element.relationships as any,
    relationships,
    relationships => {
      setNode({ relationships });
    },
    props => {
      setNode({ props });
    }
  );
  return previewProps;
}
