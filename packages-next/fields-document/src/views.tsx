/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { Node, Text } from 'slate';
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
import weakMemoize from '@emotion/weak-memoize';
import isUrl from 'is-url';
import { clientSideValidateProp } from './DocumentEditor/component-blocks/utils';

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
  formatting: {
    inlineMarks: {
      bold: boolean;
      italic: boolean;
      underline: boolean;
      strikethrough: boolean;
      code: boolean;
      superscript: boolean;
      subscript: boolean;
      keyboard: boolean;
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
      code: boolean;
    };
    softBreaks: boolean;
  };
  links: boolean;
  dividers: boolean;
  layouts: [number, ...number[]][];
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
  const memoizedIsComponentBlockValid = weakMemoize((componentBlock: ComponentBlock) =>
    weakMemoize((props: any) =>
      clientSideValidateProp({ kind: 'object', value: componentBlock.props }, props)
    )
  );
  const componentBlocks: Record<string, ComponentBlock> = config.customViews.componentBlocks || {};
  const validateNode = weakMemoize((node: Node): boolean => {
    if (Text.isText(node)) {
      return true;
    }
    if (node.type === 'component-block') {
      const componentBlock = componentBlocks[node.component as string];
      if (componentBlock) {
        if (!memoizedIsComponentBlockValid(componentBlock)(node.props)) {
          return false;
        }
      }
    }
    if (node.type === 'link' && (typeof node.href !== 'string' || !isUrl(node.href))) {
      return false;
    }
    return node.children.every(node => validateNode(node));
  });
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: `${config.path} {document(hydrateRelationships: true)}`,
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
    validate(value) {
      return value.every(node => validateNode(node));
    },
  };
};
