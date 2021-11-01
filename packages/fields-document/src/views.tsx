/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { Descendant, Node, Text } from 'slate';
import { DocumentRenderer } from '@keystone-next/document-renderer';

import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-next/keystone/types';
import weakMemoize from '@emotion/weak-memoize';
import { CellContainer, CellLink } from '@keystone-next/keystone/admin-ui/components';
import { DocumentEditor } from './DocumentEditor';
import { ComponentBlock } from './component-blocks';
import { Relationships } from './DocumentEditor/relationship';
import { clientSideValidateProp } from './DocumentEditor/component-blocks/utils';
import { ForceValidationProvider } from './DocumentEditor/utils';
import { isValidURL } from './DocumentEditor/isValidURL';

export const Field = ({
  field,
  value,
  onChange,
  autoFocus,
  forceValidation,
}: FieldProps<typeof controller>) => (
  <FieldContainer>
    <FieldLabel>{field.label}</FieldLabel>
    <ForceValidationProvider value={!!forceValidation}>
      <DocumentEditor
        autoFocus={autoFocus}
        value={value}
        onChange={onChange}
        componentBlocks={field.componentBlocks}
        relationships={field.relationships}
        documentFeatures={field.documentFeatures}
      />
    </ForceValidationProvider>
  </FieldContainer>
);

const serialize = (nodes: Node[]) => {
  return nodes.map((n: Node) => Node.string(n)).join('\n');
};

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  const value = item[field.path]?.document;
  if (!value) return null;
  const plainText = serialize(value);
  const cutText = plainText.length > 100 ? plainText.slice(0, 100) + '...' : plainText;
  return linkTo ? (
    <CellLink {...linkTo}>{cutText}</CellLink>
  ) : (
    <CellContainer>{cutText}</CellContainer>
  );
};
Cell.supportsLinkTo = true;

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <DocumentRenderer document={item[field.path]?.document || []} />
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
    componentBlocksPassedOnServer: string[];
  }>
): FieldController<Descendant[]> & {
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
  const serverSideComponentBlocksSet = new Set(config.fieldMeta.componentBlocksPassedOnServer);
  const componentBlocksOnlyBeingPassedOnTheClient = Object.keys(componentBlocks).filter(
    x => !serverSideComponentBlocksSet.has(x)
  );
  if (componentBlocksOnlyBeingPassedOnTheClient.length) {
    throw new Error(
      `(${config.listKey}:${
        config.path
      }) The following component blocks are being passed in the custom view but not in the server-side field config: ${JSON.stringify(
        componentBlocksOnlyBeingPassedOnTheClient
      )}`
    );
  }
  const clientSideComponentBlocksSet = new Set(Object.keys(componentBlocks));
  const componentBlocksOnlyBeingPassedOnTheServer =
    config.fieldMeta.componentBlocksPassedOnServer.filter(
      x => !clientSideComponentBlocksSet.has(x)
    );
  if (componentBlocksOnlyBeingPassedOnTheServer.length) {
    throw new Error(
      `(${config.listKey}:${
        config.path
      }) The following component blocks are being passed in the server-side field config but not in the custom view: ${JSON.stringify(
        componentBlocksOnlyBeingPassedOnTheServer
      )}`
    );
  }
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
    if (node.type === 'link' && (typeof node.href !== 'string' || !isValidURL(node.href))) {
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
