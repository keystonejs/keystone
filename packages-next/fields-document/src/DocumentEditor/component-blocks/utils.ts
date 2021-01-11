import { Element } from 'slate';
import { ComponentPropField, ConditionalField, RelationshipData } from '../../component-blocks';
import { DocumentFeatures } from '../../views';
import { DocumentFeaturesForNormalization } from '../document-features-normalization';
import { Relationships } from '../relationship';
import { Mark } from '../utils';
import { ChildField } from './api';
import { insertInitialValues } from './initial-values';

function _findChildPropPaths(
  value: Record<string, any>,
  props: Record<string, ComponentPropField>,
  path: (string | number)[]
) {
  let paths: { path: (string | number)[]; options: ChildField['options'] }[] = [];
  Object.keys(props).forEach(key => {
    const val = props[key];
    if (val.kind === 'form' || val.kind === 'relationship') {
    } else if (val.kind === 'child') {
      paths.push({ path: path.concat(key), options: val.options });
    } else if (val.kind === 'object') {
      paths.push(..._findChildPropPaths(value[key], val.value, path.concat(key)));
    } else if (val.kind === 'conditional') {
      paths.push(
        ..._findChildPropPaths(
          value[key],
          { value: val.values[value[key].discriminant] },
          path.concat(key)
        )
      );
    } else {
      assertNever(val);
    }
  });
  return paths;
}

export function findChildPropPaths(
  value: Record<string, any>,
  props: Record<string, ComponentPropField>
): { path: (string | number)[]; options: ChildField['options'] }[] {
  let propPaths = _findChildPropPaths(value, props, []);
  if (!propPaths.length) {
    return [
      {
        path: [VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP],
        options: { kind: 'inline', placeholder: '' },
      },
    ];
  }
  return propPaths;
}

export const VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP =
  '________VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP________';

export function assertNever(arg: never) {
  throw new Error('expected to never be called but recieved: ' + JSON.stringify(arg));
}

export type RelationshipValues = Record<
  string,
  {
    relationship: string;
    data: RelationshipData | readonly RelationshipData[] | null;
  }
>;

export function onConditionalChange(
  newValue: Record<string, any>,
  oldValue: Record<string, any>,
  path: (number | string)[],
  relationshipValues: RelationshipValues,
  relationships: Relationships,
  onRelationshipValuesChange: (relationshipValues: RelationshipValues) => void,
  onChange: (formProps: Record<string, any>) => void,
  prop: ConditionalField<any, any, any>
) {
  if (newValue.discriminant !== oldValue.discriminant) {
    // we need to remove relationships that existed in the previous discriminant
    const filteredRelationshipValues: RelationshipValues = {};
    const pathToMatch = JSON.stringify(path.concat('value')).replace(/\]$/, '');
    Object.keys(relationshipValues).forEach(relationshipPath => {
      if (!relationshipPath.startsWith(pathToMatch)) {
        filteredRelationshipValues[relationshipPath] = relationshipValues[relationshipPath];
      }
    });

    let blockProps: any = {};

    // we're not gonna do anything with this, normalizeNode will fix it
    let children: Element[] = [];

    insertInitialValues(
      blockProps,
      { value: prop.values[newValue.discriminant] },
      children,
      path,
      filteredRelationshipValues,
      relationships
    );

    onRelationshipValuesChange(filteredRelationshipValues);

    onChange({
      discriminant: newValue.discriminant,
      value: blockProps.value,
    });
  } else {
    onChange(newValue);
  }
}

export type DocumentFeaturesForChildField =
  | {
      kind: 'inline';
      inlineMarks: 'inherit' | DocumentFeatures['formatting']['inlineMarks'];
      documentFeatures: {
        links: boolean;
        relationships: boolean;
      };
      softBreaks: boolean;
    }
  | {
      kind: 'block';
      inlineMarks: 'inherit' | DocumentFeatures['formatting']['inlineMarks'];
      softBreaks: boolean;
      documentFeatures: DocumentFeaturesForNormalization;
    };

export function getDocumentFeaturesForChildField(
  editorDocumentFeatures: DocumentFeatures,
  options: ChildField['options']
): DocumentFeaturesForChildField {
  // an important note for this: normalization based on document features
  // is done based on the document features returned here
  // and the editor document features
  // so the result for any given child prop will be the things that are
  // allowed by both these document features
  // AND the editor document features
  const inlineMarksFromOptions = options.formatting?.inlineMarks;

  const inlineMarks =
    inlineMarksFromOptions === 'inherit'
      ? 'inherit'
      : Object.fromEntries(
          Object.keys(editorDocumentFeatures.formatting.inlineMarks).map(mark => {
            return [mark as Mark, !!(inlineMarksFromOptions || {})[mark as Mark]];
          })
        );
  if (options.kind === 'inline') {
    return {
      kind: 'inline',
      inlineMarks,
      documentFeatures: {
        links: options.links === 'inherit',
        relationships: options.relationships === 'inherit',
      },
      softBreaks: options.formatting?.softBreaks === 'inherit',
    };
  }
  return {
    kind: 'block',
    inlineMarks,
    softBreaks: options.formatting?.softBreaks === 'inherit',
    documentFeatures: {
      layouts: [],
      dividers: options.dividers === 'inherit' ? editorDocumentFeatures.dividers : false,
      formatting: {
        alignment:
          options.formatting?.alignment === 'inherit'
            ? editorDocumentFeatures.formatting.alignment
            : {
                center: false,
                end: false,
              },
        blockTypes:
          options.formatting?.blockTypes === 'inherit'
            ? editorDocumentFeatures.formatting.blockTypes
            : {
                blockquote: false,
                code: false,
              },
        headingLevels:
          options.formatting?.headingLevels === 'inherit'
            ? editorDocumentFeatures.formatting.headingLevels
            : options.formatting?.headingLevels || [],
        listTypes:
          options.formatting?.listTypes === 'inherit'
            ? editorDocumentFeatures.formatting.listTypes
            : {
                ordered: false,
                unordered: false,
              },
      },
      links: options.links === 'inherit',
      relationships: options.relationships === 'inherit',
    },
  };
}

export function getChildFieldAtPropPath(
  [key, ...restOfPath]: (string | number)[],
  values: Record<string, any>,
  props: Record<string, ComponentPropField>
): undefined | ChildField {
  let prop = props[key];
  if (!prop || prop.kind === 'form' || prop.kind === 'relationship') {
    return;
  }
  if (prop.kind === 'conditional') {
    const propVal = prop.values[values[key].discriminant];
    return getChildFieldAtPropPath(restOfPath, values, { value: propVal });
  }
  if (prop.kind === 'object') {
    return getChildFieldAtPropPath(restOfPath, values[key], prop.value);
  }
  return prop;
}
