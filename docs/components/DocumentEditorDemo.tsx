/** @jsx jsx */
import { getInitialPropsValue } from '@keystone-next/fields-document/src/DocumentEditor/component-blocks/initial-values';
import { FormValueContent } from '@keystone-next/fields-document/src/DocumentEditor/component-blocks/form';
import { useKeyDownRef } from '@keystone-next/fields-document/src/DocumentEditor/soft-breaks';
import React, { ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Toolbar } from '@keystone-next/fields-document/src/DocumentEditor/Toolbar';
import { DocumentFeatures } from '@keystone-next/fields-document/views';
import {
  createDocumentEditor,
  DocumentEditorEditable,
  DocumentEditorProvider,
  Editor,
} from '@keystone-next/fields-document/src/DocumentEditor';
import {
  ComponentBlock,
  fields,
  InferRenderersForComponentBlocks,
} from '@keystone-next/fields-document/component-blocks';
import { Global, jsx } from '@keystone-ui/core';

import { componentBlocks as componentBlocksInExampleProject } from '../../examples/basic/admin/fieldViews/Content';
import { initialContent } from '../lib/initialDocumentDemoContent';
import { Code } from './Code';

const headingLevels = ['1', '2', '3', '4', '5', '6'] as const;

const marks = [
  'bold',
  'code',
  'italic',
  'keyboard',
  'strikethrough',
  'subscript',
  'superscript',
  'underline',
] as const;

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
  links: fields.checkbox({
    label: 'Links',
    defaultValue: true,
  }),
  dividers: fields.checkbox({
    label: 'Dividers',
    defaultValue: true,
  }),
  softBreaks: fields.checkbox({ label: 'Soft Breaks', defaultValue: true }),
  layouts: fields.checkbox({ label: 'Layouts', defaultValue: true }),
  useShorthand: fields.checkbox({ label: 'Use shorthand in code example', defaultValue: true }),
});

type DocumentFeaturesFormValue = Parameters<
  InferRenderersForComponentBlocks<
    Record<'documentFeatures', ComponentBlock<typeof documentFeaturesProp['value']>>
  >['documentFeatures']
>[0];

const emptyObj = {};

const componentBlocks = {
  notice: componentBlocksInExampleProject.notice,
  hero: componentBlocksInExampleProject.hero,
  quote: componentBlocksInExampleProject.quote,
};

type DocumentFieldConfig = Parameters<typeof import('@keystone-next/fields-document').document>[0];

function documentFeaturesCodeExample(config: DocumentFieldConfig | DocumentFeatures) {
  return `import { config, createSchema, list } from '@keystone-next/keystone/schema';
import { document } from '@keystone-next/fields-document';

export default config({
  lists: createSchema({
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
  }),
  /* ... */
});
`;
}

function documentFeaturesToShorthand(documentFeatures: DocumentFeatures): DocumentFieldConfig {
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
  };
}

function objToShorthand<
  Obj extends Record<string, undefined | true | readonly any[] | Record<string, any>>
>(obj: Obj): Obj | true | undefined {
  const values = Object.values(obj);
  let state: typeof values[number] = values[0]!;
  for (const val of values) {
    if (val !== state || (val !== undefined && val !== true)) {
      return obj;
    }
  }
  return state as any;
}

function boolToTrueOrUndefined(bool: boolean): true | undefined {
  return bool ? true : undefined;
}

const fromEntriesButTypedWell: <Key extends string | number | symbol, Val>(
  iterable: Iterable<readonly [Key, Val]>
) => Record<Key, Val> = Object.fromEntries;

function documentFeaturesFormToValue(formValue: DocumentFeaturesFormValue): DocumentFeatures {
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
          return [mark, formValue.inlineMarks.includes(mark)];
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
  };
}

const DocumentFeaturesContext = React.createContext<{
  documentFeatures: DocumentFeatures;
  formValue: DocumentFeaturesFormValue;
  setFormValue: (value: DocumentFeaturesFormValue) => void;
}>({} as any);

export function DocumentFeaturesProvider({ children }: { children: ReactNode }) {
  const [formValue, setFormValue] = useState<DocumentFeaturesFormValue>(() =>
    getInitialPropsValue(documentFeaturesProp, {})
  );
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
  );
}

export function DocumentFeaturesFormAndCode() {
  const { documentFeatures, formValue, setFormValue } = useContext(DocumentFeaturesContext);
  return (
    <div>
      <FormValueContent
        prop={documentFeaturesProp}
        forceValidation={false}
        path={[]}
        stringifiedPropPathToAutoFocus=""
        value={formValue}
        onChange={setFormValue}
      />
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
  );
}

export const DocumentEditorDemo = () => {
  const [value, setValue] = useState(initialContent as any);
  const { documentFeatures } = useContext(DocumentFeaturesContext);

  const isShiftPressedRef = useKeyDownRef('Shift');
  const editor = useMemo(
    () => createDocumentEditor(documentFeatures, componentBlocks, emptyObj, isShiftPressedRef),
    [documentFeatures]
  );

  // this is why we're creating the editor ourselves and not using the DocumentEditor component
  useEffect(() => {
    // we want to force normalize when the document features change so
    // that no invalid things exist after a user changes something
    Editor.normalize(editor, { force: true });
  }, [documentFeatures]);

  return (
    <div
      css={{
        // the editor mostly expects things not be the default styles
        // and tailwind messes that up, so these values are from Chrome's default styles
        'blockquote, p, pre': {
          marginTop: '1em',
          marginBottom: '1em',
        },
        'h1,h2,h3,h4,h5,h6': { fontWeight: 'bold' },
        h1: { fontSize: '2em' },
        h2: { fontSize: '1.5em' },
        h3: { fontSize: '1.17em' },
        h5: { fontSize: '0.83em' },
        h6: { fontSize: '0.67em' },
        'ul, ol': {
          paddingLeft: 40,
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
          borderBottom: `1px var(--gray-200) solid`,
        }}
      >
        <DocumentEditorProvider
          value={value}
          onChange={setValue}
          editor={editor}
          componentBlocks={componentBlocks}
          documentFeatures={documentFeatures}
          relationships={emptyObj}
        >
          {useMemo(
            () => (
              <Toolbar documentFeatures={documentFeatures} />
            ),
            [documentFeatures]
          )}
          <DocumentEditorEditable />
        </DocumentEditorProvider>
      </div>
      <details css={{ marginBottom: 'var(--space-xlarge)' }}>
        <summary>View the Document Structure</summary>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </details>
    </div>
  );
};
