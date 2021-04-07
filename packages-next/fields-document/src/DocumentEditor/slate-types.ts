// it's very important that this file is
// NOT IMPORTED BY ANYTHING
// this file contains module augmentation, if it is imported
// then it will be in the generated declarations which means it will pollute
// the consumers types if they're already using slate
//
// ideally Slate would use generics instead of module augmentation so this
// wouldn't be a problem but for now, it is so
// DO NOT IMPORT THIS FILE
import { Descendant } from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor } from 'slate-react';
import { RelationshipData } from './component-blocks/api';
import { Mark } from './utils';

type Link = {
  type: 'link';
  href: string;
  children: Descendant[];
};

type Relationship = {
  type: 'relationship';
  relationship: string;
  data: RelationshipData | null;
  children: Descendant[];
};

type Layout = {
  type: 'layout';
  layout: number[];
  children: Descendant[];
};

type OnlyChildrenElements = {
  type:
    | 'blockquote'
    | 'layout-area'
    | 'code'
    | 'divider'
    | 'list-item'
    | 'list-item-content'
    | 'ordered-list'
    | 'unordered-list';
  children: Descendant[];
};

type Heading = {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  textAlign?: 'center' | 'end' | undefined;
  children: Descendant[];
};

type Paragraph = {
  type: 'paragraph';
  textAlign?: 'center' | 'end' | undefined;
  children: Descendant[];
};

type ComponentBlock = {
  type: 'component-block';
  component: string;
  props: Record<string, any>;
  children: Descendant[];
};

type ComponentProp = {
  type: 'component-inline-prop' | 'component-block-prop';
  propPath?: (string | number)[] | undefined;
  children: Descendant[];
};

type Element =
  | Layout
  | OnlyChildrenElements
  | Heading
  | ComponentBlock
  | ComponentProp
  | Paragraph
  | Link
  | Relationship;

declare module 'slate' {
  interface CustomTypes {
    Element: Element;
    Editor: { type?: undefined; children: Descendant[] } & ReactEditor & HistoryEditor;
    Text: {
      type?: undefined;
      placeholder?: string;
      text: string;
    } & { [Key in Mark | 'insertMenu']?: true };
  }
}
