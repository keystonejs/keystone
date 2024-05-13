import { Editor, type Element, type Path, Transforms, Node, type PathRef } from 'slate'
import { areArraysEqual } from '../document-features-normalization'
import { assert } from '../utils'
import { type ChildField, type ComponentBlock, type ComponentSchema } from './api'
import { getInitialPropsValue } from './initial-values'
import { getKeysForArrayValue } from './preview-props'
import { type ReadonlyPropPath } from './utils'

export function updateComponentBlockElementProps (
  editor: Editor,
  componentBlock: ComponentBlock,
  prevProps: Record<string, unknown>,
  newProps: Record<string, unknown>,
  basePath: Path,
  setElement: (partialElement: { props: Record<string, unknown> }) => void
) {
  Editor.withoutNormalizing(editor, () => {
    setElement({ props: newProps })

    const childPropPaths = findChildPropPathsWithPrevious(
      newProps,
      prevProps,
      { kind: 'object', fields: componentBlock.schema },
      [],
      [],
      []
    )

    const getNode = () => Node.get(editor, basePath) as Element

    const elementForChildren = getNode()

    if (childPropPaths.length === 0) {
      const indexes = elementForChildren.children.map((_, i) => i).reverse()
      for (const idx of indexes) {
        Transforms.removeNodes(editor, {
          at: [...basePath, idx],
        })
      }
      Transforms.insertNodes(
        editor,
        { type: 'component-inline-prop', propPath: undefined, children: [{ text: '' }] },
        { at: [...basePath, 0] }
      )
      return
    }

    const initialPropPathsToEditorPath = new Map<undefined | string, number>()
    for (const [idx, node] of elementForChildren.children.entries()) {
      assert(node.type === 'component-block-prop' || node.type === 'component-inline-prop')
      initialPropPathsToEditorPath.set(
        node.propPath === undefined ? undefined : JSON.stringify(node.propPath),
        idx
      )
    }

    const childrenLeftToAdd = new Set(childPropPaths)
    for (const childProp of childPropPaths) {
      if (childProp.prevPath === undefined) {
        continue
      }

      const stringifiedPath = JSON.stringify(childProp.prevPath)
      const idxInChildren = initialPropPathsToEditorPath.get(stringifiedPath)
      if (idxInChildren !== undefined) {
        type ChildProp = Element & { type: 'component-inline-prop' | 'component-block-prop' }
        const prevNode = elementForChildren.children[idxInChildren] as ChildProp
        assert(prevNode.propPath !== undefined)
        if (!areArraysEqual(childProp.path, prevNode.propPath)) {
          Transforms.setNodes(
            editor,
            { propPath: childProp.path },
            { at: [...basePath, idxInChildren] }
          )
        }
        childrenLeftToAdd.delete(childProp)
        initialPropPathsToEditorPath.delete(stringifiedPath)
      }
    }

    let newIdx = getNode().children.length
    for (const childProp of childrenLeftToAdd) {
      Transforms.insertNodes(
        editor,
        {
          type: `component-${childProp.options.kind}-prop`,
          propPath: childProp.path,
          children: [
            childProp.options.kind === 'block'
              ? { type: 'paragraph', children: [{ text: '' }] }
              : { text: '' },
          ],
        },
        { at: [...basePath, newIdx] }
      )
      newIdx++
    }

    const pathsToRemove: PathRef[] = []
    for (const [, idxInChildren] of initialPropPathsToEditorPath) {
      pathsToRemove.push(Editor.pathRef(editor, [...basePath, idxInChildren]))
    }
    for (const pathRef of pathsToRemove) {
      const path = pathRef.unref()
      assert(path !== null)
      Transforms.removeNodes(editor, { at: path })
    }

    const propPathsToExpectedIndexes = new Map<string, number>()
    for (const [idx, thing] of childPropPaths.entries()) {
      propPathsToExpectedIndexes.set(JSON.stringify(thing.path), idx)
    }

    outer: while (true) {
      for (const [idx, childNode] of getNode().children.entries()) {
        assert(
          childNode.type === 'component-block-prop' || childNode.type === 'component-inline-prop'
        )
        const expectedIndex = propPathsToExpectedIndexes.get(JSON.stringify(childNode.propPath))
        assert(expectedIndex !== undefined)
        if (idx === expectedIndex) continue

        Transforms.moveNodes(editor, {
          at: [...basePath, idx],
          to: [...basePath, expectedIndex],
        })

        // start the for-loop again
        continue outer
      }

      break
    }
  })
}

type ChildPropPathWithPrevious = {
  prevPath: ReadonlyPropPath | undefined
  path: ReadonlyPropPath
  options: ChildField['options']
}

function findChildPropPathsWithPrevious (
  value: any,
  prevValue: any,
  schema: ComponentSchema,
  newPath: ReadonlyPropPath,
  prevPath: ReadonlyPropPath | undefined,
  pathWithKeys: readonly string[] | undefined
): ChildPropPathWithPrevious[] {
  switch (schema.kind) {
    case 'form':
      return []
    case 'relationship':
      return []
    case 'child':
      return [{ path: newPath, prevPath, options: schema.options }]
    case 'conditional': {
      const hasChangedDiscriminant = value.discriminant === prevValue.discriminant
      return findChildPropPathsWithPrevious(
        value.value,
        hasChangedDiscriminant
          ? prevValue.value
          : getInitialPropsValue(schema.values[value.discriminant]),
        schema.values[value.discriminant],
        newPath.concat('value'),
        hasChangedDiscriminant ? undefined : prevPath?.concat('value'),
        hasChangedDiscriminant ? undefined : pathWithKeys?.concat('value')
      )
    }
    case 'object': {
      const paths: ChildPropPathWithPrevious[] = []
      for (const key of Object.keys(schema.fields)) {
        paths.push(
          ...findChildPropPathsWithPrevious(
            value[key],
            prevValue[key],
            schema.fields[key],
            newPath.concat(key),
            prevPath?.concat(key),
            pathWithKeys?.concat(key)
          )
        )
      }
      return paths
    }
    case 'array': {
      const paths: ChildPropPathWithPrevious[] = []
      const prevKeys = getKeysForArrayValue(prevValue)
      const keys = getKeysForArrayValue(value)
      for (const [i, val] of (value as unknown[]).entries()) {
        const key = keys[i]
        const prevIdx = prevKeys.indexOf(key)
        let prevVal
        if (prevIdx === -1) {
          prevVal = getInitialPropsValue(schema.element)
        } else {
          prevVal = prevValue[prevIdx]
        }
        paths.push(
          ...findChildPropPathsWithPrevious(
            val,
            prevVal,
            schema.element,
            newPath.concat(i),
            prevIdx === -1 ? undefined : prevPath?.concat(prevIdx),
            prevIdx === -1 ? undefined : pathWithKeys?.concat(key)
          )
        )
      }
      return paths
    }
  }
}
