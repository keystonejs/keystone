## Feature Example - Document Field

This project demonstrates how to configure [document fields](https://keystonejs.com/docs/guides/document-fields) in your Keystone system and render their data in a frontend application.
It builds on the [Blog](../blog) starter project.

## Instructions

To run this project, clone the Keystone repository locally then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

In a separate terminal, start the frontend dev server:

```
yarn dev:site
```

This will start the frontend at [localhost:3001](http://localhost:3001).

## Configuring fields

The project contains two `document` fields which show how to use the field configuration options to customise the document editor in the Admin UI.

### `Post.content`

For the blog post content we want the user to have the full complement of formatting and editor options available, including multi-column layouts.
To do this we use the short-hand notation of `formatting: true`, which enables all formatting features. We also enable `dividers`, `links`, and specify two additional column layouts.

We also want blog authors to be able to mention other authors in their blogs, so we enable an [inline relationship](https://next.keystonejs.com/docs/guides/document-fields#inline-relationships) for mentions.

```ts
content: document({
  formatting: true,
  dividers: true,
  links: true,
  layouts: [
    [1, 1],
    [1, 1, 1],
  ],
  relationships: {
    mention: {
      kind: 'inline',
      listKey: 'Author',
      label: 'Mention',
      selection: 'id name',
    },
  },
}),
```

### `Author.bio`

For the author bios we only want to allow bold and italics text, unordered lists, and linked text.
We use fine-grained configuration options to customise which `formatting` options are enabled.

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

## Frontend Rendering

In the `src` directory there is a Next.js frontend which uses the `DocumentRenderer` component from `@keystone-next/document-renderer` to render the document data.

We render the `Author.bio` field using the default document renderer.
This renders the content with minimal styling.

```tsx
import { DocumentRenderer } from '@keystone-next/document-renderer';

<DocumentRenderer document={author.bio.document} />;
```

For the `Post.content` field we provide a custom renderer for headings, which allows us to add our own styling.
In this case we apply `textTransform: 'uppercase'` to all of our headings, while using the default styling for all other elements.

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

<DocumentRenderer document={post.content.document} renderers={renderers} />;
```
