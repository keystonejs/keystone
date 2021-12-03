<br>
<div align="center">
  <img src="assets/readme-header.png" width="445">
  <br><br>
  <p><b>The superpowered CMS for developers</b></p>
</div>

<br>
<p>Keystone helps you build faster and scale further than any other CMS or App Framework. Just describe your schema, and get a powerful GraphQL API & beautiful Management UI for content and data.</p>
<p>No boilerplate or bootstrapping – just elegant APIs to help you ship the code that matters without sacrificing the flexibility or power of a bespoke back-end.
</p>
<sub>Looking for Keystone 5? Head over to <a href="https://github.com/keystonejs/keystone-5"><code>keystone-5</code></a>.</sub>
<br><br>

![NPM](https://img.shields.io/npm/l/keystone)
![CI](https://github.com/keystonejs/keystone/workflows/CI/badge.svg)
[![Supported by Thinkmill](https://thinkmill.github.io/badge/heart.svg)](http://thinkmill.com.au/?utm_source=github&utm_medium=badge&utm_campaign=keystone)
[![slack](https://img.shields.io/badge/chat-on%20slack-blue.svg)](https://community.keystonejs.com/)
![Twitter Follow](https://img.shields.io/twitter/follow/KeystoneJS?color=Blue&label=Follow%20KeystoneJS&logo=Twitter&logoColor=Blue&style=social)

## Contents

- [What's new](#whats-new)
- [Documentation](#documentation)
- [Version Control](#version-control)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

## What's New

[Keystone 6](http://keystonejs.com) is the new major version of KeystoneJS, the most powerful headless content management system around. We've substantially rewritten the CLI, Schema config, and Admin UI to make them more powerful and easier to use than ever before.

Keystone 6 is published on npm under the `@keystone-6` namespace. To learn about where we’re taking Keystone check out our [Roadmap](https://keystonejs.com/updates/roadmap).

### Looking for Keystone 5?

The [Keystone 5](https://github.com/keystonejs/keystone-5) codebase is now in maintenance mode and lives at [keystonejs/keystone-5](https://github.com/keystonejs/keystone-5). For more information read [Keystone 5 and beyond](https://github.com/keystonejs/keystone-5/issues/21).

## Documentation

Keystone 6 documentation lives on the [website](https://keystonejs.com/docs):

- Read [Why Keystone](https://keystonejs.com/why-keystone) to learn about our vision and what's in the box.
- [Getting Started](https://keystonejs.com/docs/walkthroughs/getting-started-with-create-keystone-app) walks you through first steps with the `create-keystone-app` CLI.
- The [Examples](./examples) directory contains a growing collection of projects you can run locally to learn more about a [Keystone feature](https://keystonejs.com/why-keystone#features).
- [API Reference](https://keystonejs.com/docs/apis) contains the details on Keystone's foundations building blocks.
- [Guides](https://keystonejs.com/docs/guides) offer practical explainers on how to build with those blocks.

> 💡 `API Docs` are complete. We're working hard on expanding coverage in our `guides` and `walkthroughs`.

## Enjoying Keystone?

- Star this repo 🌟 ☝️
- Follow Keystone on [Twitter](https://twitter.com/KeystoneJS)
- Join the conversation in [Keystone community Slack](http://community.keystonejs.com/).

### Feedback

Share your thoughts and feature requests on Slack (preferred) or Twitter. [Bugfixes and issues always welcome](https://github.com/keystonejs/keystone/issues/new/choose).

## Version control

We do our best to follow SemVer version control within Keystone. This means package versions have 3 numbers. A change in the first number indicates a breaking change, the second number indicates backward compatible feature and the third number indicates a bug fix.

You can find **changelogs** either by browsing our repository, or by using our [interactive changelog explorer](https://changelogs.xyz/@keystonejs/keystone).

A quick note on dependency management: Keystone is organised into a number of small packages within a monorepo. When packages in the same repository depend on each other, new versions might not be compatible with older versions. If two or more packages are updated, it can result in breaking changes, even though collectively they appear to be non-breaking.

We do our best to catch this but recommend updating Keystone packages together to avoid any potential conflict. This is especially important to be aware of if you use automated dependency management tools like Greenkeeper.

## Code of Conduct

KeystoneJS adheres to the [Contributor Covenant Code of Conduct](/CODE-OF-CONDUCT.md).

## License

Copyright (c) 2021 Thinkmill Labs Pty Ltd. Licensed under the MIT License.
