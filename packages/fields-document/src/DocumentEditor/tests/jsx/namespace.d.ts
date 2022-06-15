import { Node } from 'slate';
import { Mark } from '../../utils';

export const __jsx: any;

type Children = Node | string | (Node | string)[];

type OnlyChildren = { children: Children };

type ComponentProp = { children: Children; propPath?: (string | number)[] };
declare namespace __jsx {
  namespace JSX {
    interface IntrinsicElements {
      editor: { children: Children; marks?: { [Key in Mark | 'insertMenu']?: true } };
      text: { children?: Children } & { [Key in Mark | 'insertMenu']?: true };
      element: { [key: string]: any };
      cursor: { [key: string]: never };
      anchor: { [key: string]: never };
      focus: { [key: string]: never };
      layout: { layout: [number, ...number[]]; children: Children };
      'layout-area': OnlyChildren;
      blockquote: OnlyChildren;
      paragraph: {
        textAlign?: 'center' | 'end';
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
        props: Record<string, any>;
        children: Children;
      };
      'component-inline-prop': ComponentProp;
      'component-block-prop': ComponentProp;
      'ordered-list': OnlyChildren;
      'unordered-list': OnlyChildren;
      'list-item': OnlyChildren;
      'list-item-content': OnlyChildren;
      link: {
        href: string;
        children: Children;
      };
      relationship: {
        relationship: string;
        data: {
          id: string;
          label: string;
          data: {};
        };

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
