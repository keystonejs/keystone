# Document editor architecture

The document editor uses [Slate](https://github.com/ianstormtaylor/slate). To learn about Slate generally, go through <https://docs.slatejs.org/walkthroughs> and <https://docs.slatejs.org/concepts>. The sections on [Nodes](https://docs.slatejs.org/concepts/02-nodes) and [Locations](https://docs.slatejs.org/concepts/03-locations) contain especially important terminology.

## Data storage

The document field type stores its data as a JSON blob, representing the Slate data.
A trivial document with a single heading and paragraph would look like:

```json
[
  {
    "type": "heading",
    "level": 1,
    "children": [
      {
        "text": "content"
      }
    ]
  }
  {
    "type": "paragraph",
    "children": [
      {
        "text": "some text"
      }
    ]
  }
]
```

## Plugins

For normalization and handling user input and some other things (you can see what they are by looking at the type definition for the `Editor` in Slate), you write [Slate "plugins"](https://docs.slatejs.org/concepts/07-plugins).
Plugins are functions which accept an `Editor`, modify some of its properties, and then return it.

## Rendering

The rendering of the editor is like any other bit of React code.
See <https://docs.slatejs.org/concepts/08-rendering> for how rendering the document works in Slate.

The editor is very performance-sensitive because it will re-render on every keystroke so keep these things in mind while writing code for rendering the editor:

- Renderers for elements/leaves should never use `useSlate` or `useToolbarState` because those hooks will cause a re-render on every editor change. If they need to get the editor to do something in response to a user action, they should use `useStaticEditor` which will not cause re-renders.
- All state derived from the document/selection that is shown in the toolbar should come from `useToolbarState` so that it is only computed once
- Components that use `useToolbarState` and are shown when the user is typing (i.e. things that aren't in dialogs) should memoize the React elements they return with `useMemo` to avoid re-rendering when the state they consume from `useToolbarState` hasn't changed
- Calls to `useToolbarState` should be as deep as possible to re-render the smallest number of components change when the relevant part of the toolbar state changes (e.g. a tooltip should be above the component that renders the tooltip so that it doesn't need to re-render even if the button inside it needs to re-render)

## Normalization

Normalization is used in the editor to enforce a specific structure.
Slate runs normalization by going through all the changed or "dirty" nodes when changes happen on the client and calling `editor.normalizeNode` from the deepest node that changed up to the `Editor` until the normalization doesn't make any more changes.
The entire document is also normalized in `resolveInput`.

For example, if you have two lists next to each other, you want to merge them so that they're one list.
You don't want to do this in response to a specific user action because any number of things could result in two lists being next to each other so this is where you would use normalization.

Besides bespoke normalization for the different types of nodes, there is a set of generic normalization which enforces which block types can have which children. Search for `editorSchema` in the code to see how this works.

When a node is moved, normalization will not happen on that node because it did not actually change.
Normalization will happen on the old and the new parent nodes of the node that moved because both of the parent nodes children arrays changed.
If you want to enforce something about the relationship between a parent and child node, you must do this by doing normalization when `normalizeNode` is passed the parent node since the child node won't be passed to `normalizeNode` when it is moved.

## Changing the default handling of user input

For some behaviour like markdown shortcuts, you need to change the default handling of user input like converting a paragraph to a blockquote when a user types `>`.
Changing the default handling of user input is done by overriding `editor.insertText`, `editor.insertBreak`, `editor.insertData` or `onKeyDown` (which is a prop to the `Editable` component rather than on the editor instance).

## DocumentFeatures

- `DocumentFeatures` is the configuration of what is enabled in the editor
- Disabling a feature in `DocumentFeatures` disables it globally and means that it should not be shown in the toolbar and all instances of it should be normalized away
- Features can also be disabled locally for the current selection (e.g. most things are disabled in code blocks, features can be disabled inside of component child props) which will be represented in the `ToolbarState`
- The disabled status in the `ToolbarState` refers to the local disabled status only, it doesn't care about the global disabled status so a feature could have `isDisabled: false` locally and be disabled globally

## Component Blocks

Component blocks are the main way that solution developers customise the editor.
See the docs for the document field for how they're used.
The way they're represented in the structure is that nodes with the type `component-block` store the form data and they have children of type `component-block-prop` and `component-inline-prop` with a `propPath` which points to where in the props structure they are. (note that they are both blocks, "inline" and "block" in the name refers to what kind of children they contain)

## Validation

In `resolveInput`, the field enforces that the structure of the input is correct (e.g. there are no incorrect node types, no excess properties, component block props are ).
This validation should never fail as the result of the user saving a document in the Admin UI since the validation for links and component block props is done on the client and the editor should never create an invalid structure.
The validation does not enforce that the structure is fully normalized, instead it runs normalization if the validation passes.

## Relationships

The document can contain inline relationships and relationship component block props.
They are not represented in the database like actual Keystone relationships, they only store an object with an `id` property or array of objects with ids inside the document structure.
When the `hydrateRelationships` GraphQL argument is true, the field will hydrate the label for the relationship into the `label` property of the relationship object and any other selection that the solution developer specified in the config into the `data` property.
In `resolveInput`, if the `data` and `label` properties exist in relationships, they are removed so only the id is stored.

## Tests

The tests in the document editor are mainly about testing normalization and user input because most of the complexity is there.
The UI is also rendered by helpers as a smoke test to ensure nothing immediately blows up.
In tests, the document structure is written in jsx, use your editor's autocomplete to see what you can use in the jsx.
When making assertions about the document structure of the editor, you should generally use inline snapshots.
If you're abstractly testing some behaviour, for example testing markdown shortcuts for each of the marks, use `toEqualEditor`.

## Random notes

- Slate is very intentionally not exposed outside of the package so that we have the freedom to modify how the editor works. Consumers of the document field can customise the editor through the `DocumentFeatures` to disable certain features and component blocks to add custom blocks.
- `Editor`, `Node`, `Element` and etc. are both types AND runtime values that interact with the given type, for example there are things like the `children` field on the `Element` type and `isElement` on the `Element` runtime value
- The functions on `Editor` and `Transforms` like `Editor.nodes(...)`, `Transforms.delete(...)` and etc. by default refer to the current selection unless you pass it a different location.
