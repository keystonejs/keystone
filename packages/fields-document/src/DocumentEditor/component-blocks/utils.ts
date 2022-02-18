import { ComponentPropField, ConditionalField } from '../../component-blocks';
import { DocumentFeatures } from '../../views';
import { DocumentFeaturesForNormalization } from '../document-features-normalization';
import { Relationships } from '../relationship';
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
    case 'array': {
      let paths: PathToChildFieldWithOption[] = [];
      (value as any[]).forEach((val, i) => {
        paths.push(..._findChildPropPaths(val, prop.element, path.concat(i)));
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

export function assertNever(arg: never): never {
  throw new Error('expected to never be called but received: ' + JSON.stringify(arg));
}

export function getPropsForConditionalChange(
  newValue: { discriminant: string | boolean; value: any },
  oldValue: { discriminant: string | boolean; value: any },
  prop: ConditionalField<any, any>,
  relationships: Relationships
) {
  if (newValue.discriminant !== oldValue.discriminant) {
    return {
      discriminant: newValue.discriminant,
      value: getInitialPropsValue(prop.values[newValue.discriminant.toString()], relationships),
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

function getChildFieldAtPropPathInner(
  path: (string | number)[],
  value: unknown,
  prop: ComponentPropField
): undefined | ChildField {
  if (prop.kind === 'child') {
    return prop;
  }
  // because we're checking the length here
  // the non-null asserts on shift are fine
  if (path.length === 0 || prop.kind === 'form' || prop.kind === 'relationship') {
    return;
  }
  if (prop.kind === 'conditional') {
    path.shift();
    const propVal = prop.values[(value as any).discriminant];
    return getChildFieldAtPropPathInner(path, (value as any).value, propVal);
  }
  if (prop.kind === 'object') {
    const key = path.shift()!;
    return getChildFieldAtPropPathInner(path, (value as any)[key], prop.value[key]);
  }
  if (prop.kind === 'array') {
    const index = path.shift()!;
    return getChildFieldAtPropPathInner(path, (value as any)[index], prop.element);
  }

  return prop;
}

export function getChildFieldAtPropPath(
  path: readonly (string | number)[],
  value: Record<string, unknown>,
  props: Record<string, ComponentPropField>
): undefined | ChildField {
  return getChildFieldAtPropPathInner([...path], value, {
    kind: 'object',
    value: props,
  });
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
    case 'array': {
      for (const innerVal of value) {
        if (!clientSideValidateProp(prop.element, innerVal)) {
          return false;
        }
      }
      return true;
    }
  }
}

export function getAncestorFields(
  rootProp: ComponentPropField,
  path: (string | number)[],
  value: unknown
) {
  const ancestors: ComponentPropField[] = [];
  const currentPath = [...path];
  let currentProp = rootProp;
  let currentValue = value;
  while (currentPath.length) {
    ancestors.push(currentProp);
    const key = currentPath.shift()!; // this code only runs when path.length is truthy so this non-null assertion is fine
    if (currentProp.kind === 'array') {
      currentProp = currentProp.element;
      currentValue = (currentValue as any)[key];
    } else if (currentProp.kind === 'conditional') {
      currentProp = currentProp.values[(value as any).discriminant];
      currentValue = (currentValue as any).value;
    } else if (currentProp.kind === 'object') {
      currentValue = (currentValue as any)[key];
      currentProp = currentProp.value[key];
    } else if (
      currentProp.kind === 'child' ||
      currentProp.kind === 'form' ||
      currentProp.kind === 'relationship'
    ) {
      console.log(key);
      throw new Error('unexpected prop');
    } else {
      assertNever(currentProp);
    }
  }
  return ancestors;
}
