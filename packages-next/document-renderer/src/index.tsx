// TODO: this should probably live in a different package

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

interface Renderers extends MarkRenderers {
  paragraph: OnlyChildrenComponent;
  blockquote: OnlyChildrenComponent;
  pre: Component<{ children: string }> | keyof JSX.IntrinsicElements;
  link: Component<{ children: ReactNode; href: string }> | 'a';
  columns: Component<{ layout: [number, ...number[]]; children: ReactElement[] }>;
  divider: Component<{}> | keyof JSX.IntrinsicElements;
  heading: Component<{ level: 1 | 2 | 3 | 4 | 5 | 6; children: ReactNode }>;
  list: Component<{ type: 'ordered' | 'unordered'; children: ReactElement[] }>;
}

const defaultRenderers: Renderers = {
  bold: 'strong',
  code: 'code',
  keyboard: 'kbd',
  strikethrough: 's',
  italic: 'em',
  link: 'a',
  subscript: 'sub',
  superscript: 'sup',
  underline: ({ children }) => {
    return <span style={{ textDecoration: 'underline' }} children={children} />;
  },
  blockquote: 'blockquote',
  paragraph: 'p',
  divider: 'hr',
  heading: ({ level, children }) => {
    let Heading = `h${level}` as 'h1';
    return <Heading children={children} />;
  },
  pre: 'pre',
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
  columns: ({ children, layout }) => {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: layout.map(x => `${x}fr`).join(' '),
        }}
      >
        {children}
      </div>
    );
  },
};

function DocumentNode({
  node: _node,
  componentBlocks,
  renderers,
}: {
  node: Element | Text;
  renderers: Renderers;
  // TODO allow inferring from the component blocks
  componentBlocks: Record<string, Component<any>>;
}): ReactElement {
  if (typeof _node.text === 'string') {
    return <Fragment>{_node.text}</Fragment>;
  }
  const node = _node as Element;
  const children = node.children.map((x, i) => (
    <DocumentNode node={x} componentBlocks={componentBlocks} renderers={renderers} key={i} />
  ));
  switch (node.type as string) {
    case 'blockquote':
    case 'paragraph': {
      const Comp = renderers[node.type as 'blockquote' | 'paragraph'];
      return <Comp children={children} />;
    }
    case 'code': {
      if (
        node.children.length === 1 &&
        node.children[0] &&
        typeof node.children[0].text === 'string'
      ) {
        return <renderers.pre>{node.children[0].text}</renderers.pre>;
      }
      break;
    }
    case 'columns': {
      return <renderers.columns layout={node.layout as any} children={children} />;
    }
    case 'divider': {
      return <renderers.divider />;
    }
    case 'heading': {
      return <renderers.heading level={node.level as any} children={children} />;
    }
    case 'component-block': {
      const Comp = componentBlocks[node.component as string];
      if (Comp) {
        const props = createComponentBlockProps(node, children);
        return <Comp {...props} />;
      }
      break;
    }
    case 'ordered-list':
    case 'unordered-list': {
      return (
        <renderers.list
          children={children}
          type={node.type === 'ordered-list' ? 'ordered' : 'unordered'}
        />
      );
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
  const relationships = node.relationships as any;
  Object.keys(relationships).forEach(rawPropPath => {
    const propPath = JSON.parse(rawPropPath);
    set(formProps, propPath, relationships[rawPropPath]);
  });
  node.children.forEach((child, i) => {
    const propPath = [...(child.propPath as any)];
    set(formProps, propPath, children[i]);
  });
}

type Props = {
  document: Element[];
  renderers?: Partial<Renderers>;
  // TODO allow inferring from the component blocks
  componentBlocks: Record<string, Component<any>>;
};

export function DocumentRenderer(props: Props) {
  const renderers = { ...defaultRenderers, ...props.renderers };
  return (
    <Fragment>
      {props.document.map((x, i) => (
        <DocumentNode
          node={x}
          componentBlocks={props.componentBlocks}
          renderers={renderers}
          key={i}
        />
      ))}
    </Fragment>
  );
}
