/** @jsxImportSource @emotion/react */

'use client'

import React, { type ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { type DocumentFeatures } from '@keystone-6/fields-document/views'
import {
  type ComponentBlock,
  type InferRenderersForComponentBlocks,
  fields,
} from '@keystone-6/fields-document/component-blocks'
import { type document } from '@keystone-6/fields-document'
import { Global, jsx } from '@emotion/react'

import { getInitialPropsValue } from '../../../packages/fields-document/src/DocumentEditor/component-blocks/initial-values'
import { DocumentEditor, } from '../../../packages/fields-document/src/DocumentEditor'
import {
  createDocumentEditor,
  Editor,
  ReactEditor,
  withReact
} from '../../../packages/fields-document/src/DocumentEditor/demo'
import { FormValueContentFromPreviewProps } from '../../../packages/fields-document/src/DocumentEditor/component-blocks/form-from-preview'
import { createGetPreviewProps } from '../../../packages/fields-document/src/DocumentEditor/component-blocks/preview-props'
import { componentBlocks as componentBlocksInSandboxProject } from '../../../tests/sandbox/component-blocks'
import { initialContent } from '../../lib/initialDocumentDemoContent'
import { Code } from '../primitives/Code'

const headingLevels = ['1', '2', '3', '4', '5', '6'] as const

const marks = [
  'bold',
  'code',
  'italic',
  'keyboard',
  'strikethrough',
  'subscript',
  'superscript',
  'underline',
] as const

const documentFeaturesProp = fields.object({
  inlineMarks: fields.multiselect({
    options: marks.map(value => ({ label: value[0].toUpperCase() + value.slice(1), value })),
    defaultValue: marks,
    label: 'Inline Marks',
  }),
  blocks: fields.multiselect({
    label: 'Block Types',
    options: [
      { label: 'Blockquote', value: 'blockquote' },
      { label: 'Code Block', value: 'code' },
      { label: 'Ordered List', value: 'unordered' },
      { label: 'Unordered List', value: 'ordered' },
      ...headingLevels.map(value => ({ value, label: `H${value}` })),
    ] as const,
    defaultValue: ['blockquote', 'code', 'ordered', 'unordered', ...headingLevels],
  }),
  alignment: fields.multiselect({
    options: [
      { label: 'Center', value: 'center' },
      { label: 'End', value: 'end' },
    ] as const,
    defaultValue: ['center', 'end'],
    label: 'Alignment',
  }),
  softBreaks: fields.checkbox({ label: 'Soft Breaks', defaultValue: true }),
  links: fields.checkbox({
    label: 'Links',
    defaultValue: true,
  }),
  dividers: fields.checkbox({
    label: 'Dividers',
    defaultValue: true,
  }),
  layouts: fields.checkbox({ label: 'Layouts', defaultValue: true }),
  useShorthand: fields.checkbox({ label: 'Use shorthand in code example', defaultValue: true }),
})

type DocumentFeaturesFormValue = Parameters<
  InferRenderersForComponentBlocks<
    Record<'documentFeatures', ComponentBlock<(typeof documentFeaturesProp)['fields']>>
  >['documentFeatures']
>[0]

const emptyObj = {}

const componentBlocks = {
  notice: componentBlocksInSandboxProject.notice,
  hero: componentBlocksInSandboxProject.hero,
  quote: componentBlocksInSandboxProject.quote,
  checkboxList: componentBlocksInSandboxProject.checkboxList,
  carousel: componentBlocksInSandboxProject.carousel,
}

type DocumentFieldConfig = Parameters<typeof document>[0]

function documentFeaturesCodeExample (config: DocumentFieldConfig | DocumentFeatures) {
  return `import { config, list } from '@keystone-6/core';
import { document } from '@keystone-6/fields-document';

export default config({
  lists: {
    ListName: list({
      fields: {
        fieldName: document({
  ${JSON.stringify(
    config,
    (_, val) =>
      // false is an invalid value for all the inputs
      val === false
        ? undefined
        : // every value in an array on a new line looks real bad, especially for layouts
        Array.isArray(val)
        ? Array.isArray(val[0])
          ? // this case is for layouts
            val.map(x => `[${x.join(', ')}]`)
          : // this case is for headingLevels
            `[${val.join(', ')}]`
        : val,
    2
  )
    .replace(/"/g, '')
    .replace(/^{/, '')
    .replace(/{$/, '')
    .trim()
    .split('\n')
    .map(x => ' '.repeat(10) + x)
    .join('\n')}
          /* ... */
        }),
        /* ... */
      },
    }),
    /* ... */
  },
  /* ... */
});
`
}

function documentFeaturesToShorthand (documentFeatures: DocumentFeatures): DocumentFieldConfig {
  return {
    formatting: objToShorthand({
      alignment: objToShorthand({
        center: boolToTrueOrUndefined(documentFeatures.formatting.alignment.center),
        end: boolToTrueOrUndefined(documentFeatures.formatting.alignment.end),
      }),
      inlineMarks: objToShorthand(
        fromEntriesButTypedWell(
          marks.map(x => [x, boolToTrueOrUndefined(documentFeatures.formatting.inlineMarks[x])])
        )
      ),
      headingLevels:
        documentFeatures.formatting.headingLevels.length === 6
          ? true
          : documentFeatures.formatting.headingLevels.length === 0
          ? undefined
          : documentFeatures.formatting.headingLevels,
      blockTypes: objToShorthand({
        code: boolToTrueOrUndefined(documentFeatures.formatting.blockTypes.code),
        blockquote: boolToTrueOrUndefined(documentFeatures.formatting.blockTypes.blockquote),
      }),
      listTypes: objToShorthand({
        ordered: boolToTrueOrUndefined(documentFeatures.formatting.listTypes.ordered),
        unordered: boolToTrueOrUndefined(documentFeatures.formatting.listTypes.unordered),
      }),
      softBreaks: boolToTrueOrUndefined(documentFeatures.formatting.softBreaks),
    }),
    links: boolToTrueOrUndefined(documentFeatures.links),
    layouts: documentFeatures.layouts.length === 0 ? undefined : documentFeatures.layouts,
    dividers: boolToTrueOrUndefined(documentFeatures.dividers),
  }
}

function objToShorthand<
  Obj extends Record<string, undefined | true | readonly any[] | Record<string, any>>
> (obj: Obj): Obj | true | undefined {
  const values = Object.values(obj)
  const state: (typeof values)[number] = values[0]!
  for (const val of values) {
    if (val !== state || (val !== undefined && val !== true)) {
      return obj
    }
  }
  return state as any
}

function boolToTrueOrUndefined (bool: boolean): true | undefined {
  return bool ? true : undefined
}

const fromEntriesButTypedWell: <Key extends string | number | symbol, Val>(
  iterable: Iterable<readonly [Key, Val]>
) => Record<Key, Val> = Object.fromEntries

function documentFeaturesFormToValue (formValue: DocumentFeaturesFormValue): DocumentFeatures {
  return {
    formatting: {
      alignment: {
        center: formValue.alignment.includes('center'),
        end: formValue.alignment.includes('end'),
      },
      blockTypes: {
        blockquote: formValue.blocks.includes('blockquote'),
        code: formValue.blocks.includes('code'),
      },
      inlineMarks: fromEntriesButTypedWell(
        marks.map(mark => {
          return [mark, formValue.inlineMarks.includes(mark)]
        })
      ),
      headingLevels: formValue.blocks
        .map(x => parseInt(x))
        .filter(num => !isNaN(num))
        .sort() as any,
      listTypes: {
        ordered: formValue.blocks.includes('ordered'),
        unordered: formValue.blocks.includes('unordered'),
      },
      softBreaks: formValue.softBreaks,
    },
    links: formValue.links,
    layouts: formValue.layouts
      ? [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ]
      : [],
    dividers: formValue.dividers,
  }
}

const DocumentFeaturesContext = React.createContext<{
  documentFeatures: DocumentFeatures
  formValue: DocumentFeaturesFormValue
  setFormValue:(value: DocumentFeaturesFormValue) => void
}>({} as any)

export function DocumentFeaturesProvider ({ children }: { children: ReactNode }) {
  const [formValue, setFormValue] = useState<DocumentFeaturesFormValue>(() =>
    getInitialPropsValue(documentFeaturesProp)
  )
  return (
    <DocumentFeaturesContext.Provider
      value={useMemo(
        () => ({
          documentFeatures: documentFeaturesFormToValue(formValue),
          formValue,
          setFormValue,
        }),
        [formValue]
      )}
    >
      {children}
    </DocumentFeaturesContext.Provider>
  )
}

export function DocumentFeaturesFormAndCode () {
  const { formValue, setFormValue } = useContext(DocumentFeaturesContext)
  return (
    <div>
      <FormValueContentFromPreviewProps
        {...createGetPreviewProps(
          documentFeaturesProp,
          getNewVal => {
            setFormValue(getNewVal(formValue))
          },
          () => undefined
        )(formValue)}
      />
    </div>
  )
}

export function DocumentEditorDemo () {
  const [value, setValue] = useState(initialContent as any)
  const [key, setKey] = useState(0)
  const { documentFeatures, formValue } = useContext(DocumentFeaturesContext)

  useEffect(() => {
    // we want to force normalize when the document features change so
    // that no invalid things exist after a user changes something
    const editor = createDocumentEditor(documentFeatures, componentBlocks, emptyObj, {
      ReactEditor: ReactEditor as any, // TODO: somehow incompatible
      withReact
    })
    editor.children = value
    Editor.normalize(editor, { force: true })
    setValue(editor.children)
    // slate looks like it's a controlled component but it actually isn't
    // so we need to re-mount it so that it looks at the updated value
    setKey(x => x + 1)
  }, [documentFeatures])

  return (
    <div
      css={{
        // the editor mostly expects things not be the default styles
        // and tailwind messes that up, so these values are from Chrome's default styles
        'blockquote, p, pre': {
          marginTop: '1em',
          marginBottom: '1em',
          lineHeight: 1.75,
        },
        'h1,h2,h3,h4,h5,h6': { fontWeight: 'bold', margin: 0, lineHeight: 1.75 },
        h1: { fontSize: 'var(--font-xxlarge)' },
        h2: { fontSize: 'var(--font-large)' },
        h3: { fontSize: 'var(--font-medium)' },
        h5: { fontSize: 'var(--font-xsmall)' },
        h6: { fontSize: 'var(--font-xxsmall)' },
        'ul, ol': {
          lineHeight: 1.75,
        },
        button: {
          borderWidth: 0,
        },
      }}
    >
      <Global
        styles={{
          body: {
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
        }}
      />
      <div
        css={{
          marginTop: 'var(--space-xlarge)',
          marginBottom: 'var(--space-xlarge)',
        }}
      >
        <DocumentEditor
          key={key}
          value={value}
          onChange={setValue}
          componentBlocks={componentBlocks}
          documentFeatures={documentFeatures}
          relationships={emptyObj}
          initialExpanded
        />
      </div>
      <details css={{ marginBottom: 'var(--space-xlarge)' }}>
        <summary>View the Field Config</summary>
        <p>
          This is the configuration which is being used for the editor. This will be updated when
          you select options to configure the demo.
        </p>
        <div className="prose">
          <pre>
            <Code className="language-tsx">
              {useMemo(
                () =>
                  documentFeaturesCodeExample(
                    formValue.useShorthand
                      ? documentFeaturesToShorthand(documentFeatures)
                      : documentFeatures
                  ),
                [documentFeatures, formValue]
              )}
            </Code>
          </pre>
        </div>
      </details>
      <details css={{ marginBottom: 'var(--space-xlarge)' }}>
        <summary>View the Document Structure</summary>
        <p>Document field data is stored as a JSON string in the database.</p>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </details>
    </div>
  )
}
