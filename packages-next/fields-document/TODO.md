# Terminology & Spec

- `Elements` are anything you can insert in the editor (block or inline things)
- `Block Types` is a catch-all for "block-level" elements you can insert (i.e not _marks_)
- `Block Format` is the general term for a set of built-in block types you can insert. These are simple blocks that contain either text (e.g headings) or paragraphs (e.g blockquote). Conceptualy Lists are block formats, although they contain list item blocks, not paragraphs. Block formats are further specified below as Block Classes.
  - [ ] You can switch between most block formats using the toolbar and formatting shortcuts
  - [ ] When you insert a new block format using the insert menu, it inserts a new block of that type after the current one
- `Alignment` is a property of a limited number of block types
- `Inline Blocks` are special blocks you can insert that appear inline
- `Inline Marks` are formatting marks applied to text nodes within a block. Includes things like bold, italic, etc.
- `Links` are hyperlinks that can be applied to text (like a mark, with an `href` property)
- `Block Classes` represent a set of block types that implement consistent behaviour (and are often configured together)
  - `Paragraph` is the default block type at the root of the editor
    - [ ] you cannot nest paragraphs
    - [ ] supports alignment
    - [ ] supports all inline marks
    - [ ] supports links
    - [ ] supports soft breaks
    - [ ] supports inline relationships
    - [ ] enter inserts a new paragraph after the current one (including splitting remaining text)
  - `Headings` 1-6
    - [ ] only contains text, no nested blocks
    - [ ] supports alignment
    - [ ] supports links
    - [ ] supports soft breaks
    - [ ] toolbar behaves as a toggle
    - [ ] you can convert existing blocks to headings
    - [ ] inline marks and relationships are stripped when you convert a block into a heading
    - [ ] you cannot insert nested headings
    - [ ] `enter` inserts a new paragraph after the block (including splitting remaining text)
    - [ ] `backspace` at the start resets to Paragraph
  - `Lists` (technically, these contain list item blocks)
    - [ ] contains list items and nested list blocks, no other blocks
    - [ ] supports links
    - [ ] supports all inline marks
    - [ ] supports soft breaks
    - [ ] supports inline relationships
    - [ ] toolbar behaves as a toggle
    - [ ] `enter` inserts a new list item (including splitting remaining text)
    - [ ] `enter` in an empty+last-child list item resets to Paragraph after the outermost list block
    - [ ] `backspace` at the start of a list item, or in an empty list item, unwraps the list item to the parent list or converts to a paragraph at the top level (including splitting list blocks if followed by more list items)
    - [ ] can be nested, including without any items at the parent level (weird, but ok)
    - [ ] `tab` indents the current list item into a nested list of the same type
    - [ ] `shift+tab` unwraps the list up to the top level (but does not remove the outer list when you are at the top level).
    - [ ] using the toolbar to switch list types converts the parent list of the selected list item (not all parents)
  - `Formats` are paragraph-like block types that you can insert, like `blockquote` and `code`.
    - [ ] contains paragraphs
    - [ ] supports links
    - [ ] supports all inline marks
    - [ ] supports soft breaks
    - [ ] supports inline relationships
    - [ ] toolbar behaves as a toggle
    - [ ] cannot be nested
    - [ ] `backspace` at the start of the block resets to Paragraph (unwraps all paragraphs in the block)
    - [ ] `enter` inserts a new paragraph within the format block
    - [ ] `enter` in an empty+last-child paragraph resets to Paragraph after the format block
    - [ ] supports links, soft breaks, inline relationships and all inline marks
- `Divider` is a special block type you can insert that renders a horizontal line
  - [ ] Supports no children
  - [ ] Can be selected by clicking on it (displays hilighted; `backspace` or `delete` removes it)
- `Layouts` are a special block type you can insert that contain almost any other block type, laid out horizontally in configurable columns
  - [ ] contains column blocks, which must contain at least one paragraph (or other block format)
  - [ ] can contain all built-in block formats
  - [ ] can contain inline and block relationships
  - [ ] can conditionally contain component blocks (based on component config)
  - [ ] cannot be nested
  - [ ] can only be inserted at the top level of the document
  - [ ] `tab` at the end of a column moves the cursor to the start of the next column, or after the layout block
  - [ ] `shift+tab` at the start of a column moves the cursor to the end of the previous column, or before the layout block
  - [ ] layouts "trap" the selection - `enter` does not insert outside of the current column, and `backspace` does not remove columns or the layout block
  - [ ] you can select a layout by clicking in its border or margin (displays hilighted; `backspace` or `delete` removes it)
  - [ ] when a layout is the last node in a document, we ensure a paragraph exists after it
- `Relationships` are a thing you can define, with one of three types which determine where it is available. They store a reference to an itemId and are (optionally) hydrated with additional data when the document field is queried. They are voids and contain no editable text.
  - `inline` relationships can be inserted into paragraphs and lists, and appear inline (like the "mentions" pattern)
  - `block` relationships can be inserted like other blocks at the top level of the document, and inside layouts
  - `prop` relationships are available to be referenced by component block props
- `Component Blocks` are configurable block elements that you can insert at the top level, and conditionally inside layouts. They are specified in the views file with `props` (fields) and a `Preview` component that renders them in the editor.
  - `child` props must be rendered in the Preview component, and are editable in the preview. You can configure available formatting options that can be applied with the main editor toolbar, as well as rules for whether breaks, dividers, links and paragraphs can be inserted.
  - other props are rendered in the form view

# Config Spec

```js
type ComponentConfig = {
  icon?: string, // toolbar and insert menu icon
  name?: string, // defaults to humanised key
  validInside?: {
    layouts?: true,
  },
};
type FormattingConfig = {
  alignment?: {
    center?: true,
    end?: true,
  },
  blockTypes?: {
    blockquote?: true,
    code?: true,
  },
  headingLevels?: [1, 2, 3, 4, 5, 6],
  inlineMarks?: {
    bold?: true,
    code?: true,
    italic?: true,
    strikethrough?: true,
    underline?: true,
  },
  listTypes?: {
    ordered?: true,
    unordered?: true,
  },
};
type RelationshipConfig = {
  kind: 'inline',
  trigger: string, // TODO: the text trigger to insert an inline relationship
} & {
  kind: 'block' | 'prop',
  many?: true,
} & {
  icon?: string, // toolbar and insert menu icon
  labelField: 'name',
  listKey: 'User',
  name?: string, // defaults to humanised key
  selection?: string,
  where?: Record<string, any>, // TODO: filter to apply when querying available items to select from
};
type DocumentConfig = {
  // Available component blocks
  components?: {
    // Must have a corresponding export in views.componentBlocks
    [key: string]: ComponentConfig,
  },
  // Are dividers available?
  dividers?: true,
  // Available formatting options
  formatting?: FormattingConfig,
  // Available layout configurations
  layouts?: number[][],
  // Are links available?
  links?: true,
  // Available relationship blocks
  relationships?: {
    // (later) may have a corresponding export in views.relationshipBlocks
    [key: string]: RelationshipConfig,
  },
};

type ComponentChildPropConfig = {
  breaks?: true,
  dividers?: true,
  formatting?: FormattingConfig,
  links?: true,
  paragraphs?: true,
};
```

# Cleanup

- [ ] rename `columns` to `layouts`
- [ ] rename `link` config key to `links`
- [ ] nest the following in a `formatting` config key:
  - `alignment`
  - `blockTypes`
  - `headingLevels`
  - `inlineMarks`
  - `listTypes`
- [ ] support additional marks:
  - `keyboard`
  - `superscript`
  - `subscript`
- [ ] support additional block types:
  - `code`
  - `divider`
- [ ] support soft breaks in all block classes
- [ ] support paragraphs, soft breaks, links and formatting in block child props
- [ ] conditionally support component blocks inside layouts
- [ ] don't allow any other blocks inside component blocks

# Toolbar Spec

- Format [v]
  - Normal Text
  - H1-6
  - Blockquote
  - Code
- B
- I
- ... [v]
  - Code
  - Strikethrough
  - Underline
  - Superscript
  - Subscript
- Alignment
  - Start
  - Center
  - End
- Bullet List
- Numbered List
- Link
- Layout
- Insert [v]
  - Divider
  - {inline relationships}
  - {block relationships}
  - {component blocks}

## Insert Menu Spec

> Triggered by typing `/` at the start of a new line; text typed after the `/` filters the popup list. The first item is hilighted, enter inserts the selected block or applies the selected format, and keyboard up and down navigate the list. Pressing `space` or `esc` dismisses the menu. **Some** things will have icons, but not all.

- H1-6
- Blockquote
- Code block
- Bullet List
- Numbered List
- Layout
- {inline relationships}
- {block relationships}
- {component blocks}

# Features

- [ ] Work out how to properly disable classes of "insert" options based on selection
- [ ] Work out how to enable/disable features inside blocks / layout / components
- [ ] Standardise how switching between blocks works (for headings / lists / block format)
- [ ] Markdown formatting shortcuts / autoformat (see below)
- [ ] Indent and outdent list items (inc. with `tab` / `shift+tab` press)
- [ ] Insert block type / list type / component from inline menu (`/` trigger)

# UI Improvements

- [ ] Hilight blocks in red when hovering over the "remove" toolbar button
- [ ] Show icons for columns (maybe with "more..." dropdown?)
- [ ] Only show the innermost toolbar when selection is inside multiple blocks with toolbars
- [ ] Selected style for component block elements

- [ ] Can we find a way to support placeholders for child props in component blocks?
- [ ] Caret position at boundary of inline marks
- [ ] Caret position on either side of component block elements
- [ ] New inline-relationship style and selection UI with prefix support (would look more like tags w/ a popup rather than a Select)

## New marks and blocks

> These are things we don't really have a spec or requirement for yet, but should think about

- [ ] Simple image block type
- [ ] Status inline block type (with customisable colors in field config)
- [ ] Code snippet (with syntax hilighting and code editor)
- [ ] Date inline block type
- [ ] Date component prop type
- [ ] Timestamp inline block type
- [ ] Timestamp component prop type
- [ ] Action list type
- [ ] Expand block type

# Ideas

Note: the goal for these would be to allow content authors more flexibility, but without going "fully wysiwyg". We'd need some way to express design system contraints you can choose from as the content author, not complete flexibility.

- [ ] Text foreground and background color selection
- [ ] Turn `quote` and `panel` blocks into plugins (maybe just use component blocks?)
- [ ] Cloudinary Images (including uploads, sizing based on contraints)
- [ ] Media embeds (youtube, vimeo, etc)
- [ ] Tables (this is a whole other block of work...)
- [ ] Box block type -- would this be preconfigured? or configurable? if so, how?
  - Foreground and background colors
  - Background image
  - Border width and color
  - Margin (trbl | xy)
  - Padding (trbl | xy)
  - Border radius
  - Allowed children (i.e different block types you can insert inside the Box)
- [ ] Would we also have an inline box-like block?
- [ ] Should we expand on how heading and column options are defined, so we can add metadata like labels?

# Autoformat config

## Inline

> These should work inside any block that supports the type of mark.

- [ ] \* on either side of text followed by space formats **bold**
- [ ] \_ on either side of text followed by space formats _italic_
- [ ] \` on either side of text followed by space formats `inline code`
- [ ] ~~ on either side of text followed by space formats ~~strikethrough~~
- [ ] [text](url) followed by a space creates a link

## Blocks

> These should work in any standard block: paragraphs, headings, blocks (quote, code, etc) and list elements. The cursor must be at the start of the block. It converts existing blocks (including switching between list and non-list block types) except for divider, which inserts a divider and moves the selection to a new block below.

- [ ] \* or - followed by space converts to a bulleted list
- [ ] 1. or 1) followed by space converts to a numbered list
- [ ] > followed by space converts to a block quote
- [ ] \`\`\` followed by space converts to a code block
- [ ] # followed by space converts to an H1 heading
- [ ] ## followed by space converts to an H2 heading
- [ ] ### followed by space converts to an H3 heading
- [ ] #### followed by space converts to an H4 heading
- [ ] ##### followed by space converts to an H5 heading
- [ ] ###### followed by space converts to an H6 heading
- [ ] --- followed by a space to inserts a divider
