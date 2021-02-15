/** @jsx jsx */
import { Global, jsx, useTheme } from '@keystone-ui/core';
import { useMemo, useState } from 'react';

import { DocumentEditor } from '@keystone-next/fields-document/src/DocumentEditor';
import { FormValueContent } from '@keystone-next/fields-document/src/DocumentEditor/component-blocks/form';
import { getInitialPropsValue } from '@keystone-next/fields-document/src/DocumentEditor/component-blocks/initial-values';
import { DocumentFeatures } from '@keystone-next/fields-document/views';
import {
  ComponentBlock,
  fields,
  InferRenderersForComponentBlocks,
} from '@keystone-next/fields-document/component-blocks';
import { componentBlocks as componentBlocksInExampleProject } from '../../examples-next/basic/admin/fieldViews/Content';
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
  }),
  dividers: fields.checkbox({
    label: 'Dividers',
  }),
  softBreaks: fields.checkbox({ label: 'Soft Breaks' }),
  layouts: fields.checkbox({ label: 'Layouts' }),
  useShorthand: fields.checkbox({ label: 'Use shorthand in code example' }),
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
            // every value in an array on a new line looks real bad, especially for layouts
            (_, val) =>
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
            .map((x, i) => (i === 0 ? x : ' '.repeat(10) + x))
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
    layouts: documentFeatures.layouts.length === 0 ? undefined : documentFeatures.layouts,
    dividers: boolToTrueOrUndefined(documentFeatures.dividers),
    links: boolToTrueOrUndefined(documentFeatures.links),
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
  };
}

function objToShorthand<
  Obj extends Record<string, undefined | true | readonly any[] | Record<string, any>>
>(obj: Obj): Obj | true | undefined {
  let state: Obj[keyof Obj] | 'vary';
  Object.values(obj).forEach((val, i) => {
    if (i === 0) state = val as any;
    if (val !== state) {
      state = 'vary';
    }
  });
  if (state === true || state === undefined) {
    return state as true | undefined;
  }
  return obj;
}

function boolToTrueOrUndefined(bool: boolean): true | undefined {
  return bool ? true : undefined;
}

const fromEntriesButTypedWell: <Key extends string | number | symbol, Val>(
  iterable: Iterable<readonly [Key, Val]>
) => Record<Key, Val> = Object.fromEntries;

function documentFeaturesFormToValue(formValue: DocumentFeaturesFormValue): DocumentFeatures {
  console.log(
    fromEntriesButTypedWell(
      marks.map(mark => {
        return [mark, formValue.inlineMarks.includes(mark)];
      })
    )
  );
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

export function DocumentFeaturesCode() {
  return (
    <Code className="language-js">
      {useMemo(
        () =>
          documentFeaturesCodeExample(
            documentFeaturesFormValue.useShorthand
              ? documentFeaturesToShorthand(documentFeatures)
              : documentFeatures
          ),
        [documentFeatures, documentFeaturesFormValue]
      )}
    </Code>
  );
}

export const DocumentEditorDemo = () => {
  const [value, setValue] = useState([
    { type: 'paragraph', children: [{ text: 'Try using the document editor!' }] },
  ] as any);

  const theme = useTheme();
  const [documentFeaturesFormValue, setDocumentFeatures] = useState<DocumentFeaturesFormValue>(() =>
    getInitialPropsValue(documentFeaturesProp, {})
  );
  const documentFeatures = useMemo(() => documentFeaturesFormToValue(documentFeaturesFormValue), [
    documentFeaturesFormValue,
  ]);
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
          marginTop: theme.spacing.xlarge,
          marginBottom: theme.spacing.xlarge,
          borderBottom: `1px ${theme.colors.border} solid`,
        }}
      >
        <DocumentEditor
          value={value}
          onChange={setValue}
          documentFeatures={documentFeatures}
          componentBlocks={componentBlocks}
          relationships={emptyObj}
        />
      </div>
      <details css={{ marginBottom: theme.spacing.xlarge }}>
        <summary>View Document Structure</summary>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </details>
      <FormValueContent
        prop={documentFeaturesProp}
        forceValidation={false}
        path={[]}
        stringifiedPropPathToAutoFocus=""
        value={documentFeaturesFormValue}
        onChange={setDocumentFeatures}
      />
    </div>
  );
};
