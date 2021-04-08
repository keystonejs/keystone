// it's very important that this file is
// NOT IMPORTED BY ANYTHING
// this file contains module augmentation, if it is imported
// then it will be in the generated declarations which means it will pollute
// the consumers types if they're already using slate
//
// ideally Slate would use generics instead of module augmentation so this
// wouldn't be a problem but for now, it is so
// DO NOT IMPORT THIS FILE
import { RelationshipData } from './component-blocks/api';
import { Mark } from './utils';

type Link = {
  type: 'link';
  href: string;
};

type Relationship = {
  type: 'relationship';
  relationship: string;
  data: RelationshipData | null;
};

type Layout = {
  type: 'layout';
  layout: number[];
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
};

type Heading = {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  textAlign?: 'center' | 'end' | undefined;
};

type Paragraph = {
  type: 'paragraph';
  textAlign?: 'center' | 'end' | undefined;
};

type ComponentBlock = {
  type: 'component-block';
  component: string;
  props: Record<string, any>;
};

type ComponentProp = {
  type: 'component-inline-prop' | 'component-block-prop';
  propPath?: (string | number)[] | undefined;
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
    Range: { placeholder?: string };
    Editor: { type?: undefined };
    Text: {
      type?: undefined;
      placeholder?: string;
    } & { [Key in Mark | 'insertMenu']?: true };
  }
}
