import * as t from 'io-ts';
import { RelationshipValues } from './DocumentEditor/component-blocks/utils';
import { RelationshipData } from './DocumentEditor/component-blocks/api';
import { Mark } from './DocumentEditor/utils';

// note that this validation isn't about ensuring that a document has nodes in the right positions and things
// it's just about validating that it's a valid slate structure
// we'll then run normalize on it which will enforce more things
const markValue = t.union([t.undefined, t.literal(true)]);

const text = t.type({
  text: t.string,
  bold: markValue,
  italic: markValue,
  underline: markValue,
  strikethrough: markValue,
  code: markValue,
  superscript: markValue,
  subscript: markValue,
  keyboard: markValue,
});

type Inline =
  | ({ text: string } & { [Key in Mark]: true | undefined })
  | { type: 'link'; href: string; children: Inline[] };

type Link = { type: 'link'; href: string; children: Inline[] };

const link: t.Type<Link> = t.recursion('Link', () =>
  t.type({
    type: t.literal('link'),
    href: t.string,
    children: inlineChildren,
  })
);

const inline = t.union([text, link]);

const inlineChildren = t.array(inline);

type Children = (Element | Inline)[];

const layoutArea: t.Type<Layout> = t.recursion('Layout', () =>
  t.type({
    type: t.literal('layout'),
    layout: t.array(t.number),
    children,
  })
);

type Layout = {
  type: 'layout';
  layout: number[];
  children: Children;
};

const onlyChildrenElements: t.Type<OnlyChildrenElements> = t.recursion('OnlyChildrenElements', () =>
  t.type({
    type: t.union([
      t.literal('blockquote'),
      t.literal('layout-area'),
      t.literal('code'),
      t.literal('divider'),
      t.literal('list-item'),
      t.literal('ordered-list'),
      t.literal('unordered-list'),
    ]),
    children,
  })
);

type OnlyChildrenElements = {
  type:
    | 'blockquote'
    | 'layout-area'
    | 'code'
    | 'divider'
    | 'list-item'
    | 'ordered-list'
    | 'unordered-list';
  children: Children;
};

const textAlignProps = t.partial({
  textAlign: t.union([t.literal('center'), t.literal('end')]),
});

const heading: t.Type<Heading> = t.recursion('Heading', () =>
  t.intersection([
    textAlignProps,
    t.type({
      type: t.literal('heading'),
      level: t.union([
        t.literal(1),
        t.literal(2),
        t.literal(3),
        t.literal(4),
        t.literal(5),
        t.literal(6),
      ]),
      children,
    }),
  ])
);

type Heading = {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  textAlign?: 'center' | 'end';
  children: Children;
};

type Paragraph = {
  type: 'paragraph';
  textAlign?: 'center' | 'end';
  children: Children;
};

const paragraph: t.Type<Paragraph> = t.recursion('Paragraph', () =>
  t.intersection([
    textAlignProps,
    t.type({
      type: t.literal('paragraph'),

      children,
    }),
  ])
);

const relationshipData: t.Type<RelationshipData> = t.intersection([
  t.type({
    id: t.string,
  }),
  t.partial({
    label: t.string,
    data: t.record(t.string, t.any),
  }),
]);

type ComponentBlock = {
  type: 'component-block';
  relationships: RelationshipValues;
  props: Record<string, any>;
  children: Children;
};

const relationshipValues: t.Type<RelationshipValues> = t.record(
  t.string,
  t.type({
    relationship: t.string,
    data: t.union([relationshipData, t.readonlyArray(relationshipData), t.null]),
  })
);

const componentBlock: t.Type<ComponentBlock> = t.recursion('ComponentBlock', () =>
  t.type({
    type: t.literal('component-block'),
    relationships: relationshipValues,
    props: t.record(t.string, t.any),
    children,
  })
);

type ComponentProp = {
  type: 'component-inline-prop' | 'component-block-prop';
  propPath: (string | number)[];
  children: Children;
};

const componentProp: t.Type<ComponentProp> = t.recursion('ComponentProp', () =>
  t.type({
    type: t.union([t.literal('component-inline-prop'), t.literal('component-block-prop')]),
    propPath: t.array(t.union([t.string, t.number])),
    children,
  })
);

type Element = Layout | OnlyChildrenElements | Heading | ComponentBlock | ComponentProp | Paragraph;

const element: t.Type<Element> = t.recursion('Element', () =>
  t.union([layoutArea, onlyChildrenElements, heading, componentBlock, componentProp, paragraph])
);

const children: t.Type<Children> = t.recursion('Children', () =>
  t.array(t.union([element, inline]))
);

export const editorCodec = t.array(element);

export const validateDocument = (val: unknown) => {
  const result = editorCodec.validate(val, []);
  if (result._tag === 'Left') {
    throw result.left[0];
  }
};
