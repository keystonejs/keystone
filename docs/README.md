# Keystone Docs

This is for information on how to use the Keystone website. Please check out the [style guide](../STYLE_GUIDE.md) for the style choices of how to write keystone docs.

## Running the docs site in Dev

Run `pnpm dev` from the `/docs` directory

## How is the website built?

The website is a Next.js app. It is statically rendered for deployment. Documentation is spread between mdx files and some JS files (mostly for layout).

## Adding code highlighting

This website uses [Prism](https://github.com/PrismJS/prism), with slight modifications to code blocks for code highlighting and collapse blocks.

To add line highlights, you can use curly braces `{}` containing numbers or ranges separated by commas after the language.

So a base JS format would look like

```
\`\`\`js{5}
```

if you want to highlight line 5.

To highlight lines 5-10 you would write

```
\`\`\`js{5-10}
```

You can include multiple numbers and ranges:

```
\`\`\`js{1,3,5-10,15,17-19}
```

You should use code highlighting to highlight new code, or the most relevant code in a code block.

## Collapsing part of a code block

Sometimes you want to include only part of a code snippet. For this, you can collapse code blocks.

The syntax for this is

```
\`\`\`js[4-7]
```

For collapsing, you must specify a range, you cannot just specify a line.

You can specify multiple ranges to collapse

```
\`\`\`js[1-5,8-10]
```

## Collapsing and highlighting together

You can include collapsing and highlighting together.

```
\`\`\`js{1-3}[4-5]
```

You can provide the two lists in any order

```
\`\`\`js[4-5]{1-3}
```

You can only include one set of collapse ranges and one set of highlight lines.
