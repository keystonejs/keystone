import * as t from 'io-ts';
import excess from 'io-ts-excess';
import { RelationshipData } from './DocumentEditor/component-blocks/api';
import { Mark } from './DocumentEditor/utils';
import { isValidURL } from './DocumentEditor/isValidURL';
// note that this validation isn't about ensuring that a document has nodes in the right positions and things
// it's just about validating that it's a valid slate structure
// we'll then run normalize on it which will enforce more things
const markValue = t.union([t.undefined, t.literal(true)]);

const text: t.Type<TextWithMarks> = excess(
  t.type({
    text: t.string,
    bold: markValue,
    italic: markValue,
    underline: markValue,
    strikethrough: markValue,
    code: markValue,
    superscript: markValue,
    subscript: markValue,
    keyboard: markValue,
    insertMenu: markValue,
  })
);
export type TextWithMarks = { type?: never; text: string } & {
  [Key in Mark | 'insertMenu']: true | undefined;
};

type Inline = TextWithMarks | Link | Relationship;

type Link = { type: 'link'; href: string; children: Children };

class URLType extends t.Type<string> {
  readonly _tag: 'URLType' = 'URLType';
  constructor() {
    super(
      'string',
      (u): u is string => typeof u === 'string' && isValidURL(u),
      (u, c) => (this.is(u) ? t.success(u) : t.failure(u, c)),
      t.identity
    );
  }
}

const urlType = new URLType();

const link: t.Type<Link> = t.recursion('Link', () =>
  excess(
    t.type({
      type: t.literal('link'),
      href: urlType,
      children,
    })
  )
);

type Relationship = {
  type: 'relationship';
  relationship: string;
  data: RelationshipData | null;
  children: Children;
};

const relationship: t.Type<Relationship> = t.recursion('Relationship', () =>
  excess(
    t.type({
      type: t.literal('relationship'),
      relationship: t.string,
      data: t.union([t.null, relationshipData]),
      children,
    })
  )
);

const inline = t.union([text, link, relationship]);

type Children = (Block | Inline)[];

const layoutArea: t.Type<Layout> = t.recursion('Layout', () =>
  excess(
    t.type({
      type: t.literal('layout'),
      layout: t.array(t.number),
      children,
    })
  )
);

type Layout = {
  type: 'layout';
  layout: number[];
  children: Children;
};

const onlyChildrenElements: t.Type<OnlyChildrenElements> = t.recursion('OnlyChildrenElements', () =>
  excess(
    t.type({
      type: t.union([
        t.literal('blockquote'),
        t.literal('layout-area'),
        t.literal('code'),
        t.literal('divider'),
        t.literal('list-item'),
        t.literal('list-item-content'),
        t.literal('ordered-list'),
        t.literal('unordered-list'),
      ]),
      children,
    })
  )
);

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
  children: Children;
};

const textAlign = t.union([t.undefined, t.literal('center'), t.literal('end')]);

const heading: t.Type<Heading> = t.recursion('Heading', () =>
  excess(
    t.type({
      type: t.literal('heading'),
      textAlign,
      level: t.union([
        t.literal(1),
        t.literal(2),
        t.literal(3),
        t.literal(4),
        t.literal(5),
        t.literal(6),
      ]),
      children,
    })
  )
);

type Heading = {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  textAlign: 'center' | 'end' | undefined;
  children: Children;
};

type Paragraph = {
  type: 'paragraph';
  textAlign: 'center' | 'end' | undefined;
  children: Children;
};

const paragraph: t.Type<Paragraph> = t.recursion('Paragraph', () =>
  excess(
    t.type({
      type: t.literal('paragraph'),
      textAlign,
      children,
    })
  )
);

const relationshipData: t.Type<RelationshipData> = excess(
  t.type({
    id: t.string,
    label: t.union([t.undefined, t.string]),
    data: t.union([t.undefined, t.record(t.string, t.any)]),
  })
);

type ComponentBlock = {
  type: 'component-block';
  component: string;
  props: Record<string, any>;
  children: Children;
};

const componentBlock: t.Type<ComponentBlock> = t.recursion('ComponentBlock', () =>
  excess(
    t.type({
      type: t.literal('component-block'),
      component: t.string,
      props: t.record(t.string, t.any),
      children,
    })
  )
);

type ComponentProp = {
  type: 'component-inline-prop' | 'component-block-prop';
  propPath: (string | number)[] | undefined;
  children: Children;
};

const componentProp: t.Type<ComponentProp> = t.recursion('ComponentProp', () =>
  excess(
    t.type({
      type: t.union([t.literal('component-inline-prop'), t.literal('component-block-prop')]),
      propPath: t.union([t.array(t.union([t.string, t.number])), t.undefined]),
      children,
    })
  )
);

type Block = Layout | OnlyChildrenElements | Heading | ComponentBlock | ComponentProp | Paragraph;

const block: t.Type<Block> = t.recursion('Element', () =>
  t.union([layoutArea, onlyChildrenElements, heading, componentBlock, componentProp, paragraph])
);

export type ElementFromValidation = Block | Inline;

const children: t.Type<Children> = t.recursion('Children', () => t.array(t.union([block, inline])));

export const editorCodec = t.array(block);

export function isRelationshipData(val: unknown): val is RelationshipData {
  return relationshipData.validate(val, [])._tag === 'Right';
}

export function validateDocumentStructure(val: unknown): asserts val is ElementFromValidation[] {
  const result = editorCodec.validate(val, []);
  if (result._tag === 'Left') {
    throw new Error('Invalid document structure');
  }
}
