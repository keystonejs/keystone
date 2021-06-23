## Feature Example - Document Field

This project demonstrates how to add a document field to a Keystone list and render it in a Next.js frontend.
It builds on the [Blog](../blog) starter project.

## Instructions

To run this project, clone the Keystone repository locally then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

In a separate terminal, start the front-end dev server:

```
yarn dev:site
```

This will start the front-end at [localhost:3001](http://localhost:3001).

## Features

This project demonstrates how to configure [document fields](https://next.keystonejs.com/guides/document-fields) in your Keystone system and render their data in a front-end application.

### The `Post.content` field

The `Post.content` field uses the full complement of formatting and editor options, including multi-column layouts.

```ts
content: document({
  formatting: true,
  dividers: true,
  links: true,
  layouts: [
    [1, 1],
    [1, 1, 1],
  ],
}),
```

### The `Author.bio` field

The `Author.bio` field demonstrates how to use the how to use the fine-grained configuration options to customise which formatting options are supported.
In this case we only want to allow bold and italics text, unordered lists, and linked text.

```ts
bio: document({
  formatting: {
    inlineMarks: {
      bold: true,
      italic: true,
    },
    listTypes: { unordered: true },
  },
  links: true,
}),
```

### Frontend Rendering

In the `src` directory, there is a Next.js front-end which uses the `DocumentRenderer` component from `@keystone-next/document-renderer` to render the document data.

We render the `Author.bio` field using the default document renderer.

```tsx
import { DocumentRenderer, DocumentRendererProps } from '@keystone-next/document-renderer';

<DocumentRenderer document={post.author.bio?.document || []} />;
```

For the `Post.content` field we provide a custom renderer for headings, which transforms them to always be `uppercase`.

```tsx
import { DocumentRenderer, DocumentRendererProps } from '@keystone-next/document-renderer';

const renderers: DocumentRendererProps['renderers'] = {
  block: {
    heading({ level, children, textAlign }) {
      const Comp = `h${level}` as const;
      return <Comp style={{ textAlign, textTransform: 'uppercase' }}>{children}</Comp>;
    },
  },
};

<DocumentRenderer document={post.content?.document || []} renderers={renderers} />
```
