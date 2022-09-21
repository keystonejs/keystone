<br>
<div align="center">
  <img src="assets/readme-header.png" width="445">
  <br><br>
  <p><b>The superpowered CMS for developers</b></p>
</div>

<br>
<p>Keystone helps you build faster and scale further than any other CMS or App Framework. Describe your schema, and get a powerful GraphQL API & beautiful Management UI for your content and data.</p>
<p>No boilerplate or bootstrapping – just elegant APIs to help you ship the code that matters without sacrificing the flexibility or power of a bespoke back-end.
</p>
<br><br>

![NPM](https://img.shields.io/npm/l/keystone)
![CI](https://github.com/keystonejs/keystone/workflows/CI/badge.svg)
[![Supported by Thinkmill](https://thinkmill.github.io/badge/heart.svg)](http://thinkmill.com.au/?utm_source=github&utm_medium=badge&utm_campaign=keystone)
[![slack](https://img.shields.io/badge/chat-on%20slack-blue.svg)](https://community.keystonejs.com/)
![Twitter Follow](https://img.shields.io/twitter/follow/KeystoneJS?color=Blue&label=Follow%20KeystoneJS&logo=Twitter&logoColor=Blue&style=social)

## Contents

- [Usage & Documentation](#documentation)
- [Version Control](#version-control)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

## Usage & Documentation

Keystone 6 is published to npm under the `@keystone-6/*` namespace.

You can find our extended documentation on our [website](https://keystonejs.com/docs), but some quick links that might be helpful:

- Read [Why Keystone](https://keystonejs.com/why-keystone) to learn about our vision and what's in the box.
- [Getting Started](https://keystonejs.com/docs/walkthroughs/getting-started-with-create-keystone-app) walks you through first steps with the `create-keystone-app` CLI.
- Our [Examples](./examples) contain a growing collection of projects you can run locally to learn more about a [Keystone feature](https://keystonejs.com/why-keystone#features).
- An [API Reference](https://keystonejs.com/docs/apis) contains the details on Keystone's foundational building blocks.
- Some [Guides](https://keystonejs.com/docs/guides) offer practical walkthroughs on how to build with those blocks.

> 💡 While our `API Reference` is generally complete, we are are still working hard on increasing the fidelity of our `guides` and `examples`. If you have an example you'd like see, please [open a GitHub discussion](https://github.com/keystonejs/keystone/discussions/new)!

Our `@keystone-6/*` packages are written for the [Node Maintenance and Active LTS](https://github.com/nodejs/Release) versions of Node; and our continuous integration seamlessly tracks that.
You may have success with Node versions that are Pending or End-of-Life, but you may have problems too.

### Looking for Keystone 5?

The [Keystone 5](https://github.com/keystonejs/keystone-5) codebase is now in maintenance mode and lives at [keystonejs/keystone-5](https://github.com/keystonejs/keystone-5). For more information read [Keystone 5 and beyond](https://github.com/keystonejs/keystone-5/issues/21).

## Enjoying Keystone?

- Star this repo 🌟 ☝️
- Follow Keystone on [Twitter](https://twitter.com/KeystoneJS)
- Join the conversation in [Keystone community Slack](http://community.keystonejs.com/).

### Interested in what's new?

For a birds-eye view of what the Keystone project is working towards, check out our [Roadmap](https://keystonejs.com/updates/roadmap).

### Feedback

Share your thoughts and feature requests on Slack (preferred) or Twitter. [Bugfixes and issues always welcome](https://github.com/keystonejs/keystone/issues/new/choose).

## Version control

We do our best to follow SemVer version control within Keystone. This means package versions have 3 numbers. A change in the first number indicates a breaking change, the second number indicates backward compatible feature and the third number indicates a bug fix.

You can find **changelogs** either by browsing our repository, or by using our [interactive changelog explorer](https://changelogs.xyz/@keystonejs/keystone).

A quick note on dependency management: Keystone is organised into a number of small packages within a monorepo. When packages in the same repository depend on each other, new versions might not be compatible with older versions. If two or more packages are updated, it can result in breaking changes, even though collectively they appear to be non-breaking.

We do our best to catch this but recommend updating Keystone packages together to avoid any potential conflict. This is especially important to be aware of if you use automated dependency management tools like Greenkeeper.

## Code of Conduct

KeystoneJS adheres to the [Contributor Covenant Code of Conduct](/CODE-OF-CONDUCT.md).

## Security

For vulnerability reporting, please refer to our [security policy](/SECURITY.md).

## License

Copyright (c) 2022 Thinkmill Labs Pty Ltd. Licensed under the MIT License.
