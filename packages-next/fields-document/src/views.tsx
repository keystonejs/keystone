/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { Node } from 'slate';
import { CellLink, CellContainer } from '@keystone-next/admin-ui/components';

import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-next/types';
import { DocumentEditor } from './DocumentEditor';
import { ComponentBlock } from './component-blocks';
import { Relationships } from './DocumentEditor/relationship';

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => (
  <FieldContainer>
    <FieldLabel>{field.label}</FieldLabel>
    <DocumentEditor
      autoFocus={autoFocus}
      value={value}
      onChange={onChange}
      componentBlocks={field.componentBlocks}
      relationships={field.relationships}
      documentFeatures={field.documentFeatures}
    />
  </FieldContainer>
);

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  let value = item[field.path] + '';
  return linkTo ? (
    <CellLink {...linkTo}>{JSON.stringify(value)}</CellLink>
  ) : (
    <CellContainer>{JSON.stringify(value)}</CellContainer>
  );
};
Cell.supportsLinkTo = true;

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <pre>{JSON.stringify(item[field.path], null, 2)}</pre>
    </FieldContainer>
  );
};

export const allowedExportsOnCustomViews = ['componentBlocks'];

export type DocumentFeatures = {
  inlineMarks: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    code: boolean;
  };
  listTypes: {
    ordered: boolean;
    unordered: boolean;
  };
  alignment: {
    center: boolean;
    end: boolean;
  };
  headingLevels: (1 | 2 | 3 | 4 | 5 | 6)[];
  blockTypes: {
    blockquote: boolean;
    panel: boolean;
    quote: boolean;
    // code: boolean;
  };
  link: boolean;
  columns: [number, ...number[]][];
  dividers: boolean;
};

export const controller = (
  config: FieldControllerConfig<{
    relationships: Relationships;
    documentFeatures: DocumentFeatures;
  }>
): FieldController<Node[]> & {
  componentBlocks: Record<string, ComponentBlock>;
  relationships: Relationships;
  documentFeatures: DocumentFeatures;
} => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: `${config.path} {document}`,
    componentBlocks: config.customViews.componentBlocks || {},
    documentFeatures: config.fieldMeta.documentFeatures,
    relationships: config.fieldMeta.relationships,
    defaultValue: [{ type: 'paragraph', children: [{ text: '' }] }],
    deserialize: data => {
      return data[config.path]?.document || [{ type: 'paragraph', children: [{ text: '' }] }];
    },
    serialize: value => ({
      [config.path]: value,
    }),
  };
};
