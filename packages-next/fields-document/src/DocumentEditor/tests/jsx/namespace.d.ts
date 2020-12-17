import { Node } from 'slate';
import { RelationshipValues } from '../../component-blocks/utils';
import { Mark } from '../../utils';

export const __jsx: any;

type Children = Node | string | (Node | string)[];

type OnlyChildren = { children: Children };

type ComponentProp = { children: Children; propPath: (string | number)[] };
declare namespace __jsx {
  namespace JSX {
    interface IntrinsicElements {
      editor: OnlyChildren;
      text: { children?: Children } & { [Key in Mark]?: true };
      element: { [key: string]: any };
      cursor: { [key: string]: never };
      anchor: { [key: string]: never };
      focus: { [key: string]: never };
      columns: { layout: [number, ...number[]]; children: Children };
      column: OnlyChildren;
      blockquote: OnlyChildren;
      paragraph: {
        align?: 'center' | 'end';
        children: Children;
      };
      code: OnlyChildren;
      divider: OnlyChildren;
      heading: {
        level: 1 | 2 | 3 | 4 | 5 | 6;
        children: Children;
      };
      'component-block': {
        component: string;
        relationships: RelationshipValues;
        props: Record<string, any>;
        children: Children;
      };
      'component-inline-prop': ComponentProp;
      'component-block-prop': ComponentProp;
      'ordered-list': OnlyChildren;
      'unordered-list': OnlyChildren;
      'list-item': OnlyChildren;
      link: {
        url: string;
        children: Children;
      };
    }
    type Element = Node;
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
  }
}
