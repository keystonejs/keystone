# Documentation Style

This document describes the conventions for formatting and style used throughout Keystone 6 docs.

Many of these rules are enforced by the Prettier Markdown parser,
[Remark](https://github.com/remarkjs/remark/tree/master/packages/remark-parse),
which runs on `yarn format`.
Generally they also align with those suggested in Ciro Santilli's
[Markdown Style Guide](http://www.cirosantilli.com/markdown-style-guide), the de facto standard.
If Prettier doesn't have an opinion on something, and it's not covered here, go with Ciro's suggestion.

The aim of these conventions is to ensure:

- Consistency across project docs
- Readability when published as HTML (see especially the [URL Formulation Rules](#url-formulation-rules))
- Readability as plain text
- Readability when being updated (ie. in diffs)

## General

- All docs should include an intro that describes their purpose and context within the project
- Write clearly and keep it factual
- If you must assume knowledge on the part of the reader, link to related docs on the topic
- Emoji can be used, sparingly please ✨
- Ampersands should be avoided outside of headings

Also, it should go without saying:

- Ensure correct spelling; spell-check documents before committing.
  (We _favour_ UK/Australian spelling.)
- Ensure correct capitalisation, inc. product names and acronyms (eg: JavaScript, URL, Node.js).
  Note, _abbreviations_ like "etc.", "ie." and "eg." are not acronyms;
  they should only be capitalised if at the start of a sentence.
- Ensure correct English grammar (or Miss Willings will come for you 👩🏼‍🏫).
  This includes periods after abbreviations such as "etc.".

If in doubt, Google it.

## Tools

We run our Markdown through Prettier which applies many of these rule for us.
The `yarn format` command will check and update all Markdown files (and all JS).
You can use `yarn format:file MyNewDoc.md` to "pretty" a specific document.

If you're using Sublime Text, the following plugins may be of use:

- [Markdown Extended](https://packagecontrol.io/packages/Markdown%20Extended) --
  Better syntax highlighting of Markdown documents
- [MarkdownPreview](https://packagecontrol.io/packages/MarkdownPreview) --
  Allows Markdown documents to be previewed by running them through the GitHub renderer

_JM: Any tips for other editors? VS Code anyone?_

## Headings

- We prefer the ["atx" style of headings](http://www.cirosantilli.com/markdown-style-guide/#option-header-atx).
  Ie. `#`, `##`, `###`, etc.
- Each document should contain a single level 1 heading
- Headings at all levels use [Title Case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage)
- Try to keep all headings unique so they can be [linked to](#headings) reliably
- Emphasis (eg. **bold**) should not be used in place of headings
- Try to limit `code` use within headings

## Text Blocks

The sentences that form a paragraph should generally be separated with newlines.
Longer sentences, such as this one, constructed with multiple clauses,
will often require newline characters at punctuation boundaries.
Likewise, sentences will often require newlines characters when they include
[Markdown formatted links](https://www.markdownguide.org/basic-syntax#links).

There's no hard limit on line length; Prettier does not enforce one by default.
As a rule of thumb, over 120 characters is too long.

## Lists

We'd _like_ to use different bullets styles for items at different levels but Prettier forces hyphens by default.
Let's just go with that.

- Lists levels are indented with 2 spaces
  - Like this
    - And this
- Items should end in punctuation only if they contains multiple sentences.
  In other cases they should not.

Ordered lists have their own set of concerns.
It's worth noting that GitHub Markdown only cares which numbers you use for the _first item_;
it takes that as the initial value and counts up from there.
As such, there are two methods that work:

1. Usually it's preferable to number all items with `1`.
   This keeps diffs clean since inserting or removing an item doesn't re-number all subsequent items.
2. However, if the doc refers to the items _by number_ it makes sense to number them ordinarily within the Markdown.
   The Prettier will _correct the order of items_ numbered in this way which is nice (but does cause more noise in the diffs).

## Links

Links should be used generously to reference related material both inside and outside the current document.
You can link to any section in a markdown document by lower-casing its heading,
replacing spaces with hyphens and prefixing with a hash, eg: the [Text Blocks section](#text-blocks).

### URL Formulation Rules

It's important to remember that the Markdown files within this project are used in several places:

- As raw Markdown in a local dev environment (eg. in editor, search/grep'ing, etc.)
- Published on the [Keystone 6 website](https://keystonejs.com/)
- Published on the [GitHub repo](https://github.com/keystonejs/keystone)
- Published on NPM (only effects package `README.md` docs)

For links to work across these mediums, certain rules for URLs formulation must be followed:

- Links _within a file_ (ie. to headings) must not include the file name or path
  - Eg. `See the secion on [Foo Config](#foo-config).`
- Links to _other files in the monorepo_ must use..
  - An absolute file path from the monorepo root
    - Eg. `/docs/pages/guides/cli.mdx` (**not** `https://keystonejs.com/guides/cli` or `https://github.com/keystonejs/keystone/blob/main/docs/pages/guides/cli.mdx`, etc.)
  - The full filename, include the extension
    - Eg. `/docs/pages/guides/cli.mdx` (**not** `/docs/guides/cli`)
- Links to `README.md` files must be explicit; they cannot rely on the GitHub behaviour that uses `README.md` at a sort of "index" for a directory
  - Eg. `/packages/core/README.md#CLI` (**not** `/packages/core#CLI`)
- Links to directories end in a slash (eg. `/packages/core/`)
  - This as is convention for URLs (so as not to be confused with a files)

## Code and Code Blocks

Use `single backticks` only when referring to a specific tool or a single commands within a sentence.
Where possible, code blocks (using the triple backtick) should be used instead.
For example, even a small single shell commands should be given a block:

```sh
node --version
```

All code blocks should specify the language they contain;
this produces syntax highlighting when published on GitHub.
A complete list of languages recognised by GitHub can be found in the
[`linguist` languages file](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml).

## Emphasis

Emphasis should be used inline, to highlight specific points,
or to indicate notes and comments that aren't part of the document flow.

- **Bold sections** are delineated with 2 asterisk (`**text**`)
- _Italics_ can be added with a pair of underscores (`_text_`)

This differs slightly from Ciro's guide (which suggests `**` and `*`).
We believe our version is clearer to read in plain text.
It also aligns more closely with tools like Slack, which is handy.

Remember, you can also ~~strikeout~~ text using tildes (`~~text~~`).

## Tables

Use tables if it helps with clarity. Prettier will re-space the values for you
so the information will remain readable as text. Avoid using code blocks as a
pre-formatted pseudo-table. For example:

```
Name      Age
--------- -------
Jimmy     41
Janet     42
```

Just use a table:

| Name  | Age |
| ----- | --: |
| Jimmy |  41 |
| Janet |  42 |

Remember you can control the horizontal alignment of text within a column using the `:` char, as above.
