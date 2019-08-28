# Website Readme

Welcome to the website readme! This is just a quick explanation of how the website
is finding and compiling its contents, so that you can quickly understand what you
can and can't do through the website.

## What is our website built on?

Our website is built on [gatsby](https://www.gatsbyjs.org/) using [mdx](https://github.com/mdx-js/mdx)
to display pages written in markdown. To make pages display more nicely in more places, we are
parsing `.md` files using `.mdx` instead of using the `.mdx` file extension.

## Where we get content from.

The first two are the `tutorials/` and the `guides/` directories within the website folder.
These are for tutorials and guides (more on that below). This will provide most general content.

The third is `.md` files from packages. Every `.md` file in a package is converted into a page
on the website. These are used for package-specific documentation, such as API documentation. An
important TODO for us is to partially generate API documentation.

Finally, as this is a gatsby app, meaning that each file in `src/pages/` is transformed into a page
for the website. Here you can use both `.md` and `.js` to define pages.

## Where I should Add My content

### A brief detour into some definitions.

We are using certain concepts to group together our content. Our documentation is either:

- tutorial
  - designed for newer users
  - step by step guides to complete a task
  - does not explore options, nor seek to exhaustively explain options
  - should have a working output
  - example tutorials "getting your first keystone project running", "Build a field type"
- guide
  - designed for newer and intermediary users
  - explains a topic in detail, exploring different options
  - does not need a single end result, may suggest multiple implementations or options
  - explains why behind choices more extensively than tutorials
  - example guides "Best practices in constructing a field type", "Routing"
- API
  - designed for people looking for specific answers on implementation
  - may make assumptions that the person reading has a basic understanding of the system
  - Very nitty gritty documentation, mostly explanatory text, often no examples
  - Very much a glossary or dictionary - must be easily searchable
- Decision documentation
  - Rarely needed by users
  - Focused on explaining _why_ a decision was made, not just how to use it.
  - I am unsure where this will currently live.

### Back from our detour

Now that we have the same term ideas:

Most tutorials and guides for keystone should be written into the website, since most will use
or reference multiple packages. These are likely to center around topics rather than packages
as that is generally going to be the unit at which people are thinking.

Since this will be true 90% of the time, even package-specific guides should be written here.

API documentation should live with packages. For now, it should be in markdown next to the package.
We want to generate this from code in some way.

Decision documentation does not currently have a home.
