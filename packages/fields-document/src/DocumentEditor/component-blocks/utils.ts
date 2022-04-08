import { ComponentPropField } from '../../component-blocks';
import { DocumentFeatures } from '../../views';
import { DocumentFeaturesForNormalization } from '../document-features-normalization';
import { assert, Mark } from '../utils';
import { ChildField } from './api';
import { getElementIdsForArrayValue, setElementIdsForArrayValue } from './preview-props';

type PathToChildFieldWithOption = { path: ReadonlyPropPath; options: ChildField['options'] };

export function findChildPropPathsForProp(
  value: any,
  prop: ComponentPropField,
  path: ReadonlyPropPath
): PathToChildFieldWithOption[] {
  switch (prop.kind) {
    case 'form':
    case 'relationship':
      return [];
    case 'child':
      return [{ path: path, options: prop.options }];
    case 'conditional':
      return findChildPropPathsForProp(
        value.value,
        prop.values[value.discriminant],
        path.concat('value')
      );
    case 'object': {
      let paths: PathToChildFieldWithOption[] = [];
      Object.keys(prop.value).forEach(key => {
        paths.push(...findChildPropPathsForProp(value[key], prop.value[key], path.concat(key)));
      });
      return paths;
    }
    case 'array': {
      let paths: PathToChildFieldWithOption[] = [];
      (value as any[]).forEach((val, i) => {
        paths.push(...findChildPropPathsForProp(val, prop.element, path.concat(i)));
      });
      return paths;
    }
  }
}

export function findChildPropPaths(
  value: Record<string, any>,
  props: Record<string, ComponentPropField>
): { path: ReadonlyPropPath | undefined; options: ChildField['options'] }[] {
  let propPaths = findChildPropPathsForProp(value, { kind: 'object', value: props }, []);
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

function getFieldAtPropPathInner(
  path: (string | number)[],
  value: unknown,
  prop: ComponentPropField
): undefined | ComponentPropField {
  // because we're checking the length here
  // the non-null asserts on shift below are fine
  if (path.length === 0) {
    return prop;
  }
  if (prop.kind === 'child' || prop.kind === 'form' || prop.kind === 'relationship') {
    return;
  }
  if (prop.kind === 'conditional') {
    const key = path.shift();
    if (key === 'discriminant') {
      return getFieldAtPropPathInner(path, (value as any).discriminant, prop.discriminant);
    }
    if (key === 'value') {
      const propVal = prop.values[(value as any).discriminant];
      return getFieldAtPropPathInner(path, (value as any).value, propVal);
    }
    return;
  }
  if (prop.kind === 'object') {
    const key = path.shift()!;
    return getFieldAtPropPathInner(path, (value as any)[key], prop.value[key]);
  }
  if (prop.kind === 'array') {
    const index = path.shift()!;
    return getFieldAtPropPathInner(path, (value as any)[index], prop.element);
  }
  assertNever(prop);
}

export function getFieldAtPropPath(
  path: ReadonlyPropPath,
  value: Record<string, unknown>,
  props: Record<string, ComponentPropField>
): undefined | ComponentPropField {
  return getFieldAtPropPathInner([...path], value, {
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
  path: ReadonlyPropPath,
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

export type ReadonlyPropPath = readonly (string | number)[];

export function getValueAtPropPath(value: unknown, inputPath: ReadonlyPropPath) {
  const path = [...inputPath];
  while (path.length) {
    const key = path.shift()!;
    value = (value as any)[key];
  }
  return value;
}

export function traverseProps(
  prop: ComponentPropField,
  value: unknown,
  visitor: (prop: ComponentPropField, value: unknown, path: ReadonlyPropPath) => void,
  path: ReadonlyPropPath = []
) {
  if (prop.kind === 'form' || prop.kind === 'relationship' || prop.kind === 'child') {
    visitor(prop, value, path);
    return;
  }
  if (prop.kind === 'object') {
    for (const [key, childProp] of Object.entries(prop.value)) {
      traverseProps(childProp, (value as any)[key], visitor, [...path, key]);
    }
    visitor(prop, value, path);
    return;
  }
  if (prop.kind === 'array') {
    for (const [idx, val] of (value as unknown[]).entries()) {
      traverseProps(prop.element, val, visitor, path.concat(idx));
    }
    return visitor(prop, value, path);
  }
  if (prop.kind === 'conditional') {
    const discriminant: string | boolean = (value as any).discriminant;
    visitor(prop, discriminant, path.concat('discriminant'));
    traverseProps(
      prop.values[discriminant.toString()],
      (value as any).value,
      visitor,
      path.concat('value')
    );
    visitor(prop, value, path);
    return;
  }
  assertNever(prop);
}

export function replaceValueAtPropPath(
  prop: ComponentPropField,
  value: unknown,
  newValue: unknown,
  path: ReadonlyPropPath
): unknown {
  if (path.length === 0) {
    return newValue;
  }

  const [key, ...newPath] = path;

  if (prop.kind === 'object') {
    return {
      ...(value as any),
      [key]: replaceValueAtPropPath(prop.value[key], (value as any)[key], newValue, newPath),
    };
  }

  if (prop.kind === 'conditional') {
    const conditionalValue = value as { discriminant: string | boolean; value: unknown };
    // replaceValueAtPropPath should not be used to only update the discriminant of a conditional field
    // if you want to update the discriminant of a conditional field, replace the value of the whole conditional field
    assert(key === 'value');
    return {
      discriminant: conditionalValue.discriminant,
      value: replaceValueAtPropPath(prop.values[key], conditionalValue.value, newValue, newPath),
    };
  }

  if (prop.kind === 'array') {
    const prevVal = value as unknown[];
    const newVal = [...prevVal];
    setElementIdsForArrayValue(newVal, getElementIdsForArrayValue(prevVal));
    newVal[key as number] = replaceValueAtPropPath(
      prop.element,
      newVal[key as number],
      newValue,
      newPath
    );
    return newVal;
  }

  // we should never reach here since form, relationship or child fields don't contain other fields
  // so the only thing that can happen to them is to be replaced which happens at the start of this function when path.length === 0
  assert(prop.kind !== 'form' && prop.kind !== 'relationship' && prop.kind !== 'child');

  assertNever(prop);
}
