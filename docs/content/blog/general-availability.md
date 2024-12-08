---
title: "General Availability has arrived"
description: "We're proud to announce that Keystone 6 is now in General Availability! Today's Keystone is faster and more flexible than it's ever been, and is ready for you to build amazing things with."
publishDate: "2021-12-21"
authorName: "Ronald Aveling"
authorHandle: "https://twitter.com/ronaldaveling"
metaImageUrl: ""
---

We're proud to announce that Keystone 6 is now in General Availability! Today's Keystone is faster and more flexible than it's ever been, and is ready for you to build amazing things with.

![Keystone 6 is now in General Availability](/assets/blog/k6-ga.svg)

We've come a long way on the road from v5 to v6. Looking back on the journey from early concepts to a complete core, there's a great deal to be proud of. Here's an overview of the most noteworthy improvements we've shipped on our way to GA.

## Modern workflows with Prisma, NextJS & Typescript

We extended Keystone's foundations in Node, Express, and JavaScript, by adding Prisma to take care of the database layer and NextJS to power Keystone's Admin UI. We also introduced a strongly-typed developer experience to make Keystone **the most advanced TypeScript Headless CMS**.

## Automatic migrations

With Prisma under the hood, Keystone can now generate database migrations every time you update schema so you can stay focused on building awesome apps instead of wasting time with DB admin chores. Keystone migrations are now 100% automated in local, and in production you have total control over what goes where with our [new CLI](/docs/guides/cli).

## Next-generation Rich Text editor

Our new [Document field](/docs/guides/document-fields) takes the experience of creating rich content to new levels. It's highly customisable and stores JSON-structured data so you can do things like:

- insert relationships to other items in your database
- define your own [custom editor blocks](/docs/guides/document-fields#component-blocks) based on React Components
- add formatting and custom blocks from your keyboard using slash / commands

This field gives you the control you need to set your editors up for success without compromising your DX or the integrity of the data in your system. [Try the demo](/docs/guides/document-field-demo).

## More powerful APIs

Our [Fields](/docs/fields/overview), [Hooks](/docs/config/hooks), [Access Control](/docs/config/access-control), [GraphQL](/docs/graphql/overview), and [Query Filter](/docs/graphql/filters) APIs are better than ever. They're now much easier to program and have better naming parameters and more consistent authoring patterns in place so you're less likely to need our docs the every time you use that one API.

## Admin UI

Is faster and more accessible. We also made our first steps towards delivering a next-level Admin UI customisation story with the introduction of features for custom [pages](/docs/guides/custom-admin-ui-pages), [logos](/docs/guides/custom-admin-ui-logo), and [navigation](/docs/guides/custom-admin-ui-navigation).

## And much more

Here's a few of the other cool things we shipped in Keystone this year:

- Support for SQLite
- More options for field nullability and validation
- Clearer GraphQL API conventions
- Schema extension API
- More powerful Virtual Fields
- New CLI and dev experience
- [Server-side live reloading](https://github.com/keystonejs/keystone/releases/tag/2021-11-02)
- [JSON field](/docs/fields/json)
- [17 example projects](/docs/examples) to explore Keystone's many features and get you up and running on the web

This release completes a body of work that make **Keystone 6 our best developer experience yet**. If you've been waiting to tryout Keystone 6 **there's never been a better time**. Just `npm create keystone-app@latest` or read our [getting started guide](/docs/getting-started) to take your first steps.

## What's Next

While we're really happy with what we achieved this year, one of the most important benefits of our work to date is the foundations we've put in place for 2022 and beyond. [Check out our roadmap](/updates/roadmap) to understand where we're taking Keystone next year.

To talk about this release and share your thoughts about the road ahead, be sure to join the conversation in [Slack](https://community.keystonejs.com/), [GitHub](https://github.com/keystonejs/keystone/discussions) and [Twitter](https://twitter.com/keystonejs).

## Thank you

This release would not have been possible without the support and feedback of such an awesome developer community. We're grateful for the ideas you bring, the help you give others, and the code contributions you've made to get Keystone to where it is today. Thank you, and here's to a feature rich 2022!

If you like using Keystone, we'd appreciate a shout out in [Twitter](https://twitter.com/KeystoneJS) and a star in [GitHub](https://github.com/keystonejs/keystone).
