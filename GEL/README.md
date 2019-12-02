# GEL [![CircleCI](https://circleci.com/gh/WestpacGEL/GEL/tree/master.svg?style=svg)](https://circleci.com/gh/WestpacGEL/GEL/tree/master)

The design system for Westpac GEL

## Internal docs

| Purpose    | branch    | url                                    |
| ---------- | --------- | -------------------------------------- |
| Production | `master`  | https://westpacgel.netlify.com         |
| Staging    | `develop` | https://westpacgel-staging.netlify.com |

## Install and start running locally

Install dependencies

```sh
yarn
```

and then run the build:

```sh
yarn build
```

to then be able to run a component via:

```sh
yarn start button
```

## npm scripts

### root level

| script                      | description                                       |
| --------------------------- | ------------------------------------------------- |
| `yarn`                      | install all dependencies                          |
| `yarn nuke`                 | removes all `node_modules` for fresh start        |
| `yarn fresh`                | removes all `node_modules` and reinstalls them    |
| `yarn build`                | build all dist folders                            |
| `yarn dev`                  | build all dist for local consumption              |
| `yarn docs`                 | build docs for all components and open server     |
| `yarn docs:build`           | build docs for all components to `./docs/` folder |
| `yarn new [package-name]`   | create a specified empty component                |
| `yarn start [package-name]` | start the example server of a component           |
| `yarn test`                 | runs test                                         |
| `yarn format`               | runs prettier to format all code                  |

### component level

| script                  | description                      |
| ----------------------- | -------------------------------- |
| `yarn start`            | start the example server         |
| `yarn test`             | runs test headless               |
| `yarn test:dev`         | runs test by opening cypress app |
| `yarn test:integration` | runs integration tests           |

## Monorepo

```sh
.
├── LICENSE
├── README.md
├── package.json
├── yarn.lock
│
├── helper/
│   ├── example/
│   │   ├── index.js          # example wrapper for `yarn dev`
│   │   └── webpack.config.js # dynamic webpack config to run the `yarn dev` task
│   ├── docz/                 # Docz files to style the docs
│   │   ├── theme.js
│   │   └── wrapper.js
│   ├── tester.js             # Helps cypress testing of each component
│   └── cli.js                # helper file for cli like adding a new module
│
├── components/               # all ds components that will be published
│   ├── component1/
│   ├── component2/
│   └── component3/
│
├── brands/
│   ├── WBC/
│   │   ├── LICENSE
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── index.js          # only for exports
│   │   ├── fonts/            # design tokens files
│   │   └── tokens/           # font files
│   ├── STG/
│   │   └── etc
│   └── BOM/
│       └── etc
│
├── examples/                 # complex examples like templates
│   ├── demo1/                # for testing multiple components
│   │   └── tests/            # each have test folders
│   ├── demo2/
│   └── demo3/
│
└── docs/                     # the built out files for the documentation
```

## Component

```sh
.
├── README.md
├── LICENSE
├── package.json            # scope: `@westpac/`
│
├── src/                    # all the source
│   ├── index.js            # only for exports
│   ├── ComponentX.js       # only for the components, can be multiple files
│   ├── styled.js           # only for styles [optional]
│   ├── vanilla.js          # only for static site generation
│   └── _util.js            # for reused logic within the component [optional]
│
├── docs/                   # documentation for docz later
│   ├── thing1.mdx          # documenting features etc
│   └── thing2.mdx
│
├── examples/               # the demo folder is for seeing the components in action
│   ├── 00-example.js       # show-case props and variations
│   ├── 10-example.js       # all files not starting with a dot or an underscore
│   ├── 20-example.js       # will be processes with `yarn dev`
│   └── _util.js            # for reused logic within the examples [optional]
│
└── tests/                  # test includes all tests
    ├── unit/
    │   └── unit.spec.js    # jest test file for unit tests
    └── integration/
        └── test.cypress.js # cypress test file for integration tests
```

## Decisions

- All scripts are run through the `yarn` command
- The `helpers/` folder will include all helpers for builds, docs, testing etc
- We have two different example / doc concerns:
  1. Examples: they are for building components locally and to explain code per component
  1. Docs: this is a website that will be published for documenting APIs (https://westpacgel.github.io/GEL/)
- Multi-brand will be achieved by added a brand package that will be passed to the `<GEL/>` component

  ```jsx
  import { GEL } from '@westpac/core';
  import brand from '@westpac/WBC';

  export const App = () => <GEL brand={brand}>Your app</GEL>;
  ```

- Tokens and everything regarding consistent branding will be contained in the brand packages in `brands/*`
- Tokens will include these four categories:
  - `colors`
  - `layout`
  - `packs`
  - `spacing`
  - `type`
- All components use named exports as the default, no default exports
- Brands will also have a default export containing the "tokens" objects in addition to the named exports of each.
- Each component has local tokens that can be overwritten with the object passed into `<GEL/>`

  ```jsx
  import { GEL } from '@westpac/core';
  import brand from '@westpac/WBC';

  brand['@westpac/tabcordion'].heading.space = '2rem';
  brand['@westpac/tabcordion'].components.TabRow = <TabRow />;

  export const App = () => <GEL brand={brand}>Your app</GEL>;
  ```

- These local tokens are defined in the component themself and will merge the global tokens before applying them
- Each package can be addressed by its name as the key in the tokens
- The `example/` folder is for documenting composition of several components together e.g. templates
- Fonts can't be shipped with npm so the tokens only define the css declarations for the fonts
- css-in-js emotion will be used with the `jsx` pragma and babel plugin
- For css-in-js we use `jsx` imported from `@westpac/core` and never depend on `emotion` directly other than inside core itself
- All components that are made up of a group of other components like `list`, `breadcrumb`, `button-group`, `input-group` etc can be driven solely by the `data` prop
- If children have to be altered inside a component we use the `cloneElement` function when we know it's a shallow depth.
  We use context when we don't know how deep the children are going to be.

### Data driven API

Components that are made up by other components like `list`, `breadcrumb`, `button-group`, `input-group` etc can be solely driven by the `data` prop.
We also offer declarative APIs in-case a consumer wants to wrap a component.

```jsx
<Breadcrumb>
	<Crumb href="#/" text="Home" />
	<Crumb href="#/personal-banking/" text="Personal" />
	<Crumb href="#/credit-cards/" text="Credit cards" />
</Breadcrumb>
```

Is the same as:

```jsx
<Breadcrumb
	data={[
		{ href: '#/', text: 'Home' },
		{ href: '#/personal-banking/', text: 'Personal' },
		{ href: '#/credit-cards/', text: 'Credit cards' },
	]}
/>
```

### How we handle focus state

We use the useFocus hook in the `GEL` component.
You can [read about the focus hook on medium](https://medium.com/@wilkowskidom/how-i-learned-to-stop-worrying-and-love-the-outline-7a35b3b49e7).
The `GEL` also adds the global focus styling from our `PACKS.focus` token pack.
If you need to add it to something use:

```js
':focus': {
	...PACKS.focus,
},
```

However if you need a focus state that will persist across mouse users do something like this:

```jsx
const { PACKS } = useBrand();

const focus = { ...PACKS.focus };
focus.outline += ' !important'; // adding `!important` will make sure the focus persists

<Component
	css={{
		':focus': { ...focus },
	}}
/>;
```

### TOKENS

| name      | purpose                                                  |
| --------- | -------------------------------------------------------- |
| `COLORS`  | Our colors including tints                               |
| `LAYOUT`  | Only breakpoints so far                                  |
| `PACKS`   | Mostly typography packs for reuse and consistency        |
| `SPACING` | A function with minor scale to allow you to hit the grid |
| `TYPE`    | Font files and definitions                               |
| `BRAND`   | The current brand                                        |

## Local tokens naming convention (Overwrites)

| What                   | Rule                                                                 | Do                                                | Don't                                                 |
| ---------------------- | -------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| Component              | Upercase first letter                                                | `Wrapper`, `Button`                               | ~`icon`~, ~`crumb`~                                   |
| CSS rules to be spread | Either `css` lowercase alone or name then `CSS` uppercase            | `css`, `innerCSS`, `wrapperCSS`                   | ~`CSS`~, ~`innerCss`~, ~`wrapperCss`~                 |
| Theming items          | In an object with `look` as the key so we can do `localTokens[look]` | `localTokens[look].Icon`, `localTokens[look].css` | ~`localTokens.css[look]`~, ~`localTokens.Icon[look]`~ |

### Naming convention for files inside components

| name            | purpose                                                                     |
| --------------- | --------------------------------------------------------------------------- |
| `index.js`      | Export only public API                                                      |
| `styled.js`     | Only for styled components `[optional]`                                     |
| `_utils.js`     | For code shared between components (ignored in examples) `[optional]`       |
| `ComponentX.js` | All component files are named after the exported component and pascal cased |
| `00-*.js`       | All files inside the `examples/` folder are sorted by file name             |
| `*.js`          | All jsx files are postfixed with `.js`                                      |
| `*.spec.js`     | All (jest) unit tests are postfixed with `.spec.js`                         |

## Props API vocabulary

| Prop                                       | Description                                                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `tag`                                      | When a component can be rendered as different tags                                                          |
| `look`                                     | When talking about the look of a component like `success` or `hero`                                         |
| `href`                                     | When something points at a thing via a link                                                                 |
| `icon` `iconLeft` `iconRight`              | For passing in an icon                                                                                      |
| `disabled` or `noBorder`                   | For passing boolean flags we use natural language and not `is` or `has` prefixes                            |
| `size`                                     | For the physical size of a component, should be: `'small', 'medium', 'large', 'xlarge'`                     |
| `value`                                    | For when a component shows a value, often numbers but not only                                              |
| `selected`                                 | For things inside lists that are being targeted. Like `ButtonGroups` or `CheckGroup`. Takes string or array |
| `label`                                    | For labeling things that are visible or a11y text                                                           |
| `xsmall` `small` `medium` `large` `xlarge` | For t-shirt sizing                                                                                          |
| `data`                                     | A prop to drive a component-group from data alone                                                           |
