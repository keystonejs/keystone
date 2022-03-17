/** @jsxRuntime classic */
/** @jsx jsx */

import {
  Fragment,
  ReactElement,
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { ReactEditor, RenderElementProps, useFocused, useSelected } from 'slate-react';
import { Editor, Element, Path, PathRef, Transforms, Node } from 'slate';

import { jsx, useTheme } from '@keystone-ui/core';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';
import { Tooltip } from '@keystone-ui/tooltip';

import { NotEditable } from '../../component-blocks';

import { InlineDialog, ToolbarButton, ToolbarGroup, ToolbarSeparator } from '../primitives';
import { ComponentPropField, ComponentBlock } from '../../component-blocks';
import {
  insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading,
  useElementWithSetNodes,
  useStaticEditor,
} from '../utils';
import { assert } from '../utils';
import { areArraysEqual } from '../document-features-normalization';
import { clientSideValidateProp, getFieldAtPropPath, ReadonlyPropPath } from './utils';
import { ChildrenByPathContext, getElementIdsForArrayValue } from './preview-props';
import { getInitialPropsValue, getInitialValue } from './initial-values';
import { FormValue } from './edit-mode';
import { createGetPreviewProps } from './preview-props';
import { ChildField } from './api';

export { withComponentBlocks } from './with-component-blocks';

export const ComponentBlockContext = createContext<Record<string, ComponentBlock>>({});

export function getPlaceholderTextForPropPath(
  propPath: ReadonlyPropPath,
  fields: Record<string, ComponentPropField>,
  formProps: Record<string, any>
): string {
  const field = getFieldAtPropPath(propPath, formProps, fields);
  if (field?.kind === 'child') {
    return field.options.placeholder;
  }
  return '';
}

export function ComponentInlineProp(props: RenderElementProps) {
  return <span {...props.attributes}>{props.children}</span>;
}

export function insertComponentBlock(
  editor: Editor,
  componentBlocks: Record<string, ComponentBlock>,
  componentBlock: string
) {
  let node = getInitialValue(componentBlock, componentBlocks[componentBlock]);
  insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, node);
  const componentBlockEntry = Editor.above(editor, {
    match: node => node.type === 'component-block',
  });
  if (componentBlockEntry) {
    const start = Editor.start(editor, componentBlockEntry[1]);
    Transforms.setSelection(editor, { anchor: start, focus: start });
  }
}

export const BlockComponentsButtons = ({ onClose }: { onClose: () => void }) => {
  const editor = useStaticEditor();
  const blockComponents = useContext(ComponentBlockContext)!;
  return (
    <Fragment>
      {Object.keys(blockComponents).map(key => (
        <ToolbarButton
          key={key}
          onMouseDown={event => {
            event.preventDefault();
            insertComponentBlock(editor, blockComponents, key);
            onClose();
          }}
        >
          {blockComponents[key].label}
        </ToolbarButton>
      ))}
    </Fragment>
  );
};

export const ComponentBlocksElement = ({
  attributes,
  children,
  element: __elementToGetPath,
}: RenderElementProps & { element: { type: 'component-block' } }) => {
  const editor = useStaticEditor();
  const focused = useFocused();
  const selected = useSelected();
  const [editMode, setEditMode] = useState(false);
  const [currentElement, setElement] = useElementWithSetNodes(editor, __elementToGetPath);
  const { colors, fields, spacing, typography } = useTheme();
  const blockComponents = useContext(ComponentBlockContext)!;
  const componentBlock = blockComponents[currentElement.component] as ComponentBlock | undefined;
  const isValid = useMemo(() => {
    return componentBlock
      ? clientSideValidateProp(
          { kind: 'object', value: componentBlock.props },
          currentElement.props
        )
      : true;
  }, [componentBlock, currentElement.props]);

  const onCloseEditView = useCallback(() => {
    setEditMode(false);
  }, []);

  const elementToGetPathRef = useRef({ __elementToGetPath, currentElement });

  useEffect(() => {
    elementToGetPathRef.current = { __elementToGetPath, currentElement };
  });

  const onPropsChange = useCallback(
    (cb: (prevProps: Record<string, unknown>) => Record<string, unknown>) => {
      Editor.withoutNormalizing(editor, () => {
        const prevProps = elementToGetPathRef.current.currentElement.props;
        const elementForChildren = elementToGetPathRef.current.__elementToGetPath;
        let newProps = cb(prevProps);
        setElement({ props: newProps });
        const things = findChildPropPathsButDifferent(
          newProps,
          prevProps,
          { kind: 'object', value: componentBlock!.props },
          [],
          [],
          []
        );
        const basePath = ReactEditor.findPath(editor, elementForChildren);
        if (things.length === 0) {
          const refs = elementForChildren.children.map((_, i) =>
            Editor.pathRef(editor, [...basePath, i])
          );
          for (const ref of refs) {
            Transforms.removeNodes(editor, {
              at: ref.unref()!,
            });
          }
          Transforms.insertNodes(
            editor,
            { type: 'component-inline-prop', propPath: undefined, children: [{ text: '' }] },
            { at: [...basePath, 0] }
          );
          return;
        }
        const initialPropPathsToEditorPath = new Map<undefined | string, Path>();
        for (const [idx, node] of elementForChildren.children.entries()) {
          assert(node.type === 'component-block-prop' || node.type === 'component-inline-prop');
          initialPropPathsToEditorPath.set(
            node.propPath === undefined ? undefined : JSON.stringify(node.propPath),
            [...basePath, idx]
          );
        }
        const thingsLeftToAdd = new Set(things);
        for (const thing of things) {
          if (thing.prevPath === undefined) {
            continue;
          }
          const stringifiedPath = JSON.stringify(thing.prevPath);
          const editorPath = initialPropPathsToEditorPath.get(stringifiedPath);
          if (editorPath) {
            const expectedType = `component-${thing.options.kind}-prop` as const;
            type ChildProp = Element & { type: 'component-inline-prop' | 'component-block-prop' };
            const changes: Partial<ChildProp> = {};
            const prevNode = elementForChildren.children[
              editorPath[editorPath.length - 1]
            ] as ChildProp;
            assert(prevNode.propPath !== undefined);
            if (!areArraysEqual(thing.path, prevNode.propPath)) {
              changes.propPath = thing.path;
            }
            if (prevNode.type !== expectedType) {
              changes.type = expectedType;
            }
            if (Object.keys(changes).length) {
              Transforms.setNodes(editor, changes, { at: editorPath });
            }
            thingsLeftToAdd.delete(thing);
            initialPropPathsToEditorPath.delete(stringifiedPath);
          }
        }
        const pathsToRemove: PathRef[] = [];
        for (const [, editorPath] of initialPropPathsToEditorPath) {
          pathsToRemove.push(Editor.pathRef(editor, editorPath));
        }
        for (const pathRef of pathsToRemove) {
          const path = pathRef.unref();
          assert(path !== null);
          Transforms.removeNodes(editor, { at: path });
        }
        let newIdx = elementForChildren.children.length;
        for (const thing of thingsLeftToAdd) {
          Transforms.insertNodes(
            editor,
            {
              type: `component-${thing.options.kind}-prop`,
              propPath: thing.path,
              children: [
                thing.options.kind === 'block'
                  ? { type: 'paragraph', children: [{ text: '' }] }
                  : { text: '' },
              ],
            },
            { at: [...basePath, newIdx] }
          );
          newIdx++;
        }
        const propPathsToExpectedIndexes = new Map<string, number>();
        for (const [idx, thing] of things.entries()) {
          propPathsToExpectedIndexes.set(JSON.stringify(thing.path), idx);
        }
        outer: while (true) {
          for (const [idx, childNode] of (
            Node.get(editor, basePath) as Element
          ).children.entries()) {
            assert(
              childNode.type === 'component-block-prop' ||
                childNode.type === 'component-inline-prop'
            );
            const expectedIndex = propPathsToExpectedIndexes.get(
              JSON.stringify(childNode.propPath)
            );
            assert(expectedIndex !== undefined);
            if (idx !== expectedIndex) {
              Transforms.moveNodes(editor, {
                at: [...basePath, idx],
                to: [...basePath, expectedIndex],
              });
              continue outer;
            }
          }
          break;
        }
      });
    },
    [setElement, componentBlock, editor]
  );

  const getPreviewProps = useMemo(() => {
    if (!componentBlock) {
      return () => {
        throw new Error('expected component block to exist when called');
      };
    }
    return createGetPreviewProps({ kind: 'object', value: componentBlock.props }, onPropsChange);
  }, [componentBlock, onPropsChange]);

  if (!componentBlock) {
    return (
      <div css={{ border: 'red 4px solid', padding: spacing.medium }}>
        <pre contentEditable={false} css={{ userSelect: 'none' }}>
          {`The block "${currentElement.component}" no longer exists.

Props:

${JSON.stringify(currentElement.props, null, 2)}

Content:`}
        </pre>
        {children}
      </div>
    );
  }

  const previewProps = getPreviewProps(currentElement.props);
  return (
    <div
      data-with-chrome={!componentBlock.chromeless}
      css={{
        marginBottom: spacing.xlarge,
        marginTop: spacing.xlarge,

        '&[data-with-chrome=true]': {
          paddingLeft: spacing.xlarge,
          position: 'relative',

          ':before': {
            content: '" "',
            backgroundColor: editMode ? colors.linkColor : colors.border,
            borderRadius: 4,
            width: 4,
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1,
          },
        },
      }}
      {...attributes}
    >
      {!componentBlock.chromeless && (
        <NotEditable
          css={{
            color: fields.legendColor,
            display: 'block',
            fontSize: typography.fontSize.small,
            fontWeight: typography.fontWeight.bold,
            lineHeight: 1,
            marginBottom: spacing.small,
            textTransform: 'uppercase',
          }}
        >
          {componentBlock.label}
        </NotEditable>
      )}
      {editMode && <FormValue isValid={isValid} props={previewProps} onClose={onCloseEditView} />}
      <div css={{ display: editMode ? 'none' : 'block', position: 'relative' }}>
        {editMode ? (
          children
        ) : (
          <ComponentBlockRender
            children={children}
            componentBlock={componentBlock}
            element={currentElement}
            onChange={onPropsChange}
          />
        )}
        {!editMode &&
          (() => {
            const ChromefulToolbar = componentBlock.toolbar
              ? componentBlock.toolbar
              : DefaultToolbarWithChrome;
            const ChromelessToolbar =
              componentBlock.chromeless && componentBlock.toolbar
                ? componentBlock.toolbar
                : DefaultToolbarWithoutChrome;
            return componentBlock.chromeless ? (
              focused && selected && (
                <InlineDialog isRelative>
                  <ChromelessToolbar
                    onRemove={() => {
                      const path = ReactEditor.findPath(editor, __elementToGetPath);
                      Transforms.removeNodes(editor, { at: path });
                    }}
                    props={previewProps}
                  />
                </InlineDialog>
              )
            ) : (
              <ChromefulToolbar
                isValid={isValid}
                onRemove={() => {
                  const path = ReactEditor.findPath(editor, __elementToGetPath);
                  Transforms.removeNodes(editor, { at: path });
                }}
                onShowEditMode={() => {
                  setEditMode(true);
                }}
                props={previewProps}
              />
            );
          })()}
      </div>
    </div>
  );
};

function DefaultToolbarWithChrome({
  onShowEditMode,
  onRemove,
  isValid,
}: {
  onShowEditMode(): void;
  onRemove(): void;
  props: any;
  isValid: boolean;
}) {
  const theme = useTheme();
  return (
    <ToolbarGroup as={NotEditable} marginTop="small">
      <ToolbarButton
        onClick={() => {
          onShowEditMode();
        }}
      >
        Edit
      </ToolbarButton>
      <ToolbarSeparator />
      <Tooltip content="Remove" weight="subtle">
        {attrs => (
          <ToolbarButton
            variant="destructive"
            onClick={() => {
              onRemove();
            }}
            {...attrs}
          >
            <Trash2Icon size="small" />
          </ToolbarButton>
        )}
      </Tooltip>
      {!isValid && (
        <Fragment>
          <ToolbarSeparator />
          <span
            css={{
              color: theme.palette.red500,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: theme.spacing.small,
            }}
          >
            Please edit the form, there are invalid fields.
          </span>
        </Fragment>
      )}
    </ToolbarGroup>
  );
}

function DefaultToolbarWithoutChrome({
  onRemove,
}: {
  onRemove(): void;
  props: Record<string, any>;
}) {
  return (
    <Tooltip content="Remove" weight="subtle">
      {attrs => (
        <ToolbarButton
          variant="destructive"
          onMouseDown={event => {
            event.preventDefault();
            onRemove();
          }}
          {...attrs}
        >
          <Trash2Icon size="small" />
        </ToolbarButton>
      )}
    </Tooltip>
  );
}

function ComponentBlockRender({
  componentBlock,
  element,
  onChange,
  children,
}: {
  element: Element & { type: 'component-block' };
  onChange: (cb: (props: Record<string, unknown>) => Record<string, unknown>) => void;
  componentBlock: ComponentBlock;
  children: any;
}) {
  const getPreviewProps = useMemo(() => {
    return createGetPreviewProps({ kind: 'object', value: componentBlock.props }, props => {
      onChange(props);
    });
  }, [onChange, componentBlock]);

  const previewProps = getPreviewProps(element.props);

  const childrenByPath: Record<string, ReactElement> = {};
  let maybeChild: ReactElement | undefined;
  children.forEach((child: ReactElement) => {
    const propPath = child.props.children.props.element.propPath;
    if (propPath === undefined) {
      maybeChild = child;
    } else {
      childrenByPath[JSON.stringify(propPathWithIndiciesToKeys(propPath, element.props))] = child;
    }
  });

  const ComponentBlockPreview = componentBlock.component;

  return (
    <ChildrenByPathContext.Provider value={childrenByPath}>
      {useMemo(
        () => (
          <ComponentBlockPreview {...previewProps} />
        ),
        [previewProps, ComponentBlockPreview]
      )}
      <span css={{ display: 'none' }}>{maybeChild}</span>
    </ChildrenByPathContext.Provider>
  );
}

function propPathWithIndiciesToKeys(propPath: ReadonlyPropPath, val: any): readonly string[] {
  return propPath.map(key => {
    if (typeof key === 'string') {
      val = val[key];
      return key;
    }
    const keys = getElementIdsForArrayValue(val);
    val = val[key];
    return keys[key];
  });
}

// function findChangedArrayFields(
//   componentBlock: ComponentBlock,
//   value: unknown,
//   prevValue: unknown
// ) {
//   let changedArrayFields: { newPath: ReadonlyPropPath; newKeys: string[]; prevKeys: string[] }[] =
//     [];
//   findChangedArrayFieldsInner(
//     { kind: 'object', value: componentBlock.props },
//     value,
//     prevValue,
//     [],
//     changedArrayFields
//   );
//   return changedArrayFields;
// }

// function findChangedArrayFieldsInner(
//   field: ComponentPropField,
//   value: unknown,
//   prevValue: unknown,
//   path: ReadonlyPropPath,
//   changedArrayFields: { path: ReadonlyPropPath; newKeys: string[]; prevKeys: string[] }[]
// ) {
//   if (value === prevValue) {
//     return;
//   }
//   if (field.kind === 'child' || field.kind === 'form' || field.kind === 'relationship') {
//     return;
//   }
//   if (field.kind === 'conditional') {
//     const newDiscriminant: string | boolean = (value as any).discriminant;
//     const oldDiscriminant: string | boolean = (prevValue as any).discriminant;
//     findChangedArrayFieldsInner(
//       field.values[newDiscriminant.toString()],
//       (value as any).value,
//       newDiscriminant === oldDiscriminant
//         ? (prevValue as any).value
//         : getInitialPropsValue(field.values[newDiscriminant.toString()]),
//       path.concat('value'),
//       changedArrayFields
//     );
//     return;
//   }
//   if (field.kind === 'object') {
//     for (const [key, innerField] of Object.entries(field.value)) {
//       findChangedArrayFieldsInner(
//         innerField,
//         (value as any)[key],
//         (prevValue as any)[key],
//         path.concat(key),
//         changedArrayFields
//       );
//     }
//     return;
//   }
//   if (field.kind === 'array') {
//     const arrayValue = value as readonly unknown[];
//     const prevArrayValue = prevValue as readonly unknown[];
//     const keys = getElementIdsForArrayValue(arrayValue);
//     const prevKeys = getElementIdsForArrayValue(prevArrayValue);
//     if (!areArraysEqual(keys, prevKeys)) {
//       changedArrayFields.push({ path, newKeys: keys, prevKeys });
//     }
//     let initialInnerVal;

//     for (const [idx, val] of arrayValue.entries()) {
//       let key = keys[idx];
//       let indexOfKeyInPrev = prevKeys.indexOf(key);
//       let prevVal;
//       if (indexOfKeyInPrev === -1) {
//         if (initialInnerVal === undefined) {
//           initialInnerVal = getInitialPropsValue(field.element);
//         }
//         prevVal = initialInnerVal;
//       } else {
//         prevVal = prevArrayValue[indexOfKeyInPrev];
//       }
//       findChangedArrayFieldsInner(
//         field.element,
//         val,
//         prevVal,
//         path.concat(idx),
//         changedArrayFields
//       );
//     }
//     return;
//   }

//   assertNever(field);
// }

type Stuff = {
  prevPath?: ReadonlyPropPath;
  path: ReadonlyPropPath;
  options: ChildField['options'];
};

function findChildPropPathsButDifferent(
  value: any,
  prevValue: any,
  prop: ComponentPropField,
  newPath: ReadonlyPropPath,
  prevPath: ReadonlyPropPath | undefined,
  pathWithKeys: readonly string[] | undefined
): Stuff[] {
  switch (prop.kind) {
    case 'form':
    case 'relationship':
      return [];
    case 'child':
      return [{ path: newPath, prevPath, options: prop.options }];
    case 'conditional':
      const hasChangedDiscriminant = value.discriminant === prevValue.discriminant;
      return findChildPropPathsButDifferent(
        value.value,
        hasChangedDiscriminant
          ? prevValue.value
          : getInitialPropsValue(prop.values[value.discriminant]),
        prop.values[value.discriminant],
        newPath.concat('value'),
        hasChangedDiscriminant ? undefined : prevPath?.concat('value'),
        hasChangedDiscriminant ? undefined : pathWithKeys?.concat('value')
      );
    case 'object': {
      let paths: Stuff[] = [];
      Object.keys(prop.value).forEach(key => {
        paths.push(
          ...findChildPropPathsButDifferent(
            value[key],
            prevValue[key],
            prop.value[key],
            newPath.concat(key),
            prevPath?.concat(key),
            pathWithKeys?.concat(key)
          )
        );
      });
      return paths;
    }
    case 'array': {
      let paths: Stuff[] = [];
      const prevKeys = getElementIdsForArrayValue(prevValue);
      const keys = getElementIdsForArrayValue(value);
      for (const [i, val] of (value as unknown[]).entries()) {
        const key = keys[i];
        const prevIdx = prevKeys.indexOf(key);
        let prevVal;
        if (prevIdx === -1) {
          prevVal = getInitialPropsValue(prop.element);
        } else {
          prevVal = prevValue[prevIdx];
        }
        paths.push(
          ...findChildPropPathsButDifferent(
            val,
            prevVal,
            prop.element,
            newPath.concat(i),
            prevIdx === -1 ? undefined : prevPath?.concat(prevIdx),
            prevIdx === -1 ? undefined : pathWithKeys?.concat(key)
          )
        );
      }
      return paths;
    }
  }
}
