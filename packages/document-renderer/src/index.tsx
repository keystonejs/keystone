import React, { Fragment, ReactElement, ReactNode } from 'react';

type Node = Element | Text;

type Mark =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code'
  | 'superscript'
  | 'subscript'
  | 'keyboard';

type Element = {
  children: Node[];
  [key: string]: unknown;
};

type Text = {
  text: string;
  [key: string]: unknown;
};

type Component<Props> = (props: Props) => ReactElement | null;

type OnlyChildrenComponent = Component<{ children: ReactNode }> | keyof JSX.IntrinsicElements;

type MarkRenderers = { [Key in Mark]: OnlyChildrenComponent };

interface Renderers {
  inline: {
    link: Component<{ children: ReactNode; href: string }> | 'a';
    relationship: Component<{
      relationship: string;
      data: { id: string; label: string | undefined; data: Record<string, any> | undefined } | null;
    }>;
  } & MarkRenderers;
  block: {
    block: OnlyChildrenComponent;
    paragraph: Component<{ children: ReactNode; textAlign: 'center' | 'end' | undefined }>;
    blockquote: OnlyChildrenComponent;
    code: Component<{ children: string }> | keyof JSX.IntrinsicElements;
    layout: Component<{ layout: [number, ...number[]]; children: ReactElement[] }>;
    divider: Component<{}> | keyof JSX.IntrinsicElements;
    heading: Component<{
      level: 1 | 2 | 3 | 4 | 5 | 6;
      children: ReactNode;
      textAlign: 'center' | 'end' | undefined;
    }>;
    list: Component<{ type: 'ordered' | 'unordered'; children: ReactElement[] }>;
  };
}

export const defaultRenderers: Renderers = {
  inline: {
    bold: 'strong',
    code: 'code',
    keyboard: 'kbd',
    strikethrough: 's',
    italic: 'em',
    link: 'a',
    subscript: 'sub',
    superscript: 'sup',
    underline: 'u',
    relationship: ({ data }) => {
      return <span>{data?.label || data?.id}</span>;
    },
  },
  block: {
    block: 'div',
    blockquote: 'blockquote',
    paragraph: ({ children, textAlign }) => {
      return <p style={{ textAlign }}>{children}</p>;
    },
    divider: 'hr',
    heading: ({ level, children, textAlign }) => {
      let Heading = `h${level}` as 'h1';
      return <Heading style={{ textAlign }} children={children} />;
    },
    code: 'pre',
    list: ({ children, type }) => {
      const List = type === 'ordered' ? 'ol' : 'ul';
      return (
        <List>
          {children.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </List>
      );
    },
    layout: ({ children, layout }) => {
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: layout.map(x => `${x}fr`).join(' '),
          }}
        >
          {children.map((element, i) => (
            <div key={i}>{element}</div>
          ))}
        </div>
      );
    },
  },
};

function DocumentNode({
  node: _node,
  componentBlocks,
  renderers,
}: {
  node: Element | Text;
  renderers: Renderers;
  // TODO: allow inferring from the component blocks
  componentBlocks: Record<string, Component<any>>;
}): ReactElement {
  if (typeof _node.text === 'string') {
    let child = <Fragment>{_node.text}</Fragment>;
    (Object.keys(renderers.inline) as (keyof typeof renderers.inline)[]).forEach(markName => {
      if (markName !== 'link' && markName !== 'relationship' && _node[markName]) {
        const Mark = renderers.inline[markName];
        child = <Mark>{child}</Mark>;
      }
    });

    return child;
  }
  const node = _node as Element;
  const children = node.children.map((x, i) => (
    <DocumentNode node={x} componentBlocks={componentBlocks} renderers={renderers} key={i} />
  ));
  switch (node.type as string) {
    case 'blockquote': {
      return <renderers.block.blockquote children={children} />;
    }
    case 'paragraph': {
      return <renderers.block.paragraph textAlign={node.textAlign as any} children={children} />;
    }
    case 'code': {
      if (
        node.children.length === 1 &&
        node.children[0] &&
        typeof node.children[0].text === 'string'
      ) {
        return <renderers.block.code>{node.children[0].text}</renderers.block.code>;
      }
      break;
    }
    case 'layout': {
      return <renderers.block.layout layout={node.layout as any} children={children} />;
    }
    case 'divider': {
      return <renderers.block.divider />;
    }
    case 'heading': {
      return (
        <renderers.block.heading
          textAlign={node.textAlign as any}
          level={node.level as any}
          children={children}
        />
      );
    }
    case 'component-block': {
      const Comp = componentBlocks[node.component as string];
      if (Comp) {
        const props = createComponentBlockProps(node, children);
        return (
          <renderers.block.block>
            <Comp {...props} />
          </renderers.block.block>
        );
      }
      break;
    }
    case 'ordered-list':
    case 'unordered-list': {
      return (
        <renderers.block.list
          children={children}
          type={node.type === 'ordered-list' ? 'ordered' : 'unordered'}
        />
      );
    }
    case 'relationship': {
      const data = node.data as any;
      return (
        <renderers.inline.relationship
          relationship={node.relationship as string}
          data={data ? { id: data.id, label: data.label, data: data.data } : null}
        />
      );
    }
    case 'link': {
      return <renderers.inline.link href={node.href as string}>{children}</renderers.inline.link>;
    }
  }
  return <Fragment>{children}</Fragment>;
}

function set(obj: Record<string, any>, propPath: (string | number)[], value: any) {
  if (propPath.length === 1) {
    obj[propPath[0]] = value;
  } else {
    let firstElement = propPath.shift()!;
    set(obj[firstElement], propPath, value);
  }
}

function createComponentBlockProps(node: Element, children: ReactElement[]) {
  const formProps = JSON.parse(JSON.stringify(node.props));
  node.children.forEach((child, i) => {
    if (child.propPath) {
      const propPath = [...(child.propPath as any)];
      set(formProps, propPath, children[i]);
    }
  });
  return formProps;
}

export type DocumentRendererProps<
  ComponentBlocks extends Record<string, Component<any>> = Record<string, Component<any>>
> = {
  document: Element[];
  renderers?: { inline?: Partial<Renderers['inline']>; block?: Partial<Renderers['block']> };
  componentBlocks?: ComponentBlocks;
};

export function DocumentRenderer<ComponentBlocks extends Record<string, Component<any>>>(
  props: DocumentRendererProps<ComponentBlocks>
) {
  const renderers = {
    inline: { ...defaultRenderers.inline, ...props.renderers?.inline },
    block: { ...defaultRenderers.block, ...props.renderers?.block },
  };
  const componentBlocks = props.componentBlocks || {};
  return (
    <Fragment>
      {props.document.map((x, i) => (
        <DocumentNode node={x} componentBlocks={componentBlocks} renderers={renderers} key={i} />
      ))}
    </Fragment>
  );
}
