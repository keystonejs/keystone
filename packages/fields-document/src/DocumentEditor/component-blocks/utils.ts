import { ComponentPropField, ConditionalField } from '../../component-blocks';
import { DocumentFeatures } from '../../views';
import { DocumentFeaturesForNormalization } from '../document-features-normalization';
import { Mark } from '../utils';
import { ChildField } from './api';
import { getInitialPropsValue } from './initial-values';

type PathToChildFieldWithOption = { path: (string | number)[]; options: ChildField['options'] };

function _findChildPropPaths(
  value: any,
  prop: ComponentPropField,
  path: (string | number)[]
): PathToChildFieldWithOption[] {
  switch (prop.kind) {
    case 'form':
    case 'relationship':
      return [];
    case 'child':
      return [{ path: path, options: prop.options }];
    case 'conditional':
      return _findChildPropPaths(
        value.value,
        prop.values[value.discriminant],
        path.concat('value')
      );
    case 'object': {
      let paths: PathToChildFieldWithOption[] = [];
      Object.keys(prop.value).forEach(key => {
        paths.push(..._findChildPropPaths(value[key], prop.value[key], path.concat(key)));
      });
      return paths;
    }
  }
}

export function findChildPropPaths(
  value: Record<string, any>,
  props: Record<string, ComponentPropField>
): { path: (string | number)[] | undefined; options: ChildField['options'] }[] {
  let propPaths = _findChildPropPaths(value, { kind: 'object', value: props }, []);
  if (!propPaths.length) {
    return [
      {
        path: undefined,
        options: { kind: 'inline', placeholder: '' },
      },
    ];
  }
  return propPaths;
}

export function assertNever(arg: never) {
  throw new Error('expected to never be called but received: ' + JSON.stringify(arg));
}

export function getPropsForConditionalChange(
  newValue: Record<string, any>,
  oldValue: Record<string, any>,
  prop: ConditionalField<any, any, any>
) {
  if (newValue.discriminant !== oldValue.discriminant) {
    return {
      discriminant: newValue.discriminant,
      value: getInitialPropsValue(prop.values[newValue.discriminant]),
    };
  } else {
    return newValue;
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
      : (Object.fromEntries(
          Object.keys(editorDocumentFeatures.formatting.inlineMarks).map(mark => {
            return [mark as Mark, !!(inlineMarksFromOptions || {})[mark as Mark]];
          })
        ) as Record<Mark, boolean>);
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

export function clientSideValidateProp(prop: ComponentPropField, value: any): boolean {
  switch (prop.kind) {
    case 'child':
    case 'relationship': {
      return true;
    }
    case 'form': {
      return prop.validate(value);
    }
    case 'conditional': {
      if (!prop.discriminant.validate(value.discriminant)) {
        return false;
      }
      return clientSideValidateProp(prop.values[value.discriminant], value.value);
    }
    case 'object': {
      for (const [key, childProp] of Object.entries(prop.value)) {
        if (!clientSideValidateProp(childProp, value[key])) {
          return false;
        }
      }
      return true;
    }
  }
}
