<!--[meta]
section: blog
title: New Release - Cornice
author: The Keystone Team
date: 2020-09-21
order: 0.5
tags: release
[meta]-->

> For full release notes see: [Our versioning PR](https://github.com/keystonejs/keystone/pull/3642)

## An intro to release posts

Hi! For a while we have been doing weekly releases, and if you were following Keystone closely, you would know that we release every Monday (Australia time). We want to do a better job at surfacing this, highlighting the most important changes in the release with all y'all. So we are going to be writing a weekly post to go alongside the release that helps out. As an extra addition, we are going to be naming all of our releases, with building terms in alphabetical order.

> Why is the first release `cornice` if we are going in alphabetical order? We have experimented with naming both `arcade` and `buttress` beforehand, and `cornice` is where we're committing to sharing more about these.

## Installing a particular release

Upgrading all keystone packages you depend on can be a bit of a slog, and while we want to make this easier by having you depend on fewer packages in the future, for now, we have added some helpers to another open source project we run, [manypkg](https://www.npmjs.com/package/@manypkg/cli#manypkg-upgrade-packagename-tag-or-version) to make upgrading easier. If you install manypkg, you can now run

```
manypkg upgrade @keystonejs cornice
```

to get all packages in the scope synced on the `cornice` release.

If you're just after latest, you can use

```
manypkg upgrade @keystonejs
```

## Cornice Release Notes:

And here is the main attraction! What's up with the Cornice release?

### Breaking Changes

- Updated dependency pino to ^6.6.1. See the pino [release notes](https://github.com/pinojs/pino/releases/tag/v6.0.0) for breaking changes to logging output. In particular, the `v` field is no longer logged out, and `null` message values are handled differently. Unless you depend on these finer details of the Keystone error logs you won't need to make any changes to your app.

### Other Changes:

- Enabled schema tracing if `APOLLO_KEY` is set.
- Removed some unused dependencies (helping with your install size a little)
- Updated a bunch of packages we depend on (we've been getting comfortable with renovate)

### @arch-ui/drawer

- Fixed touch-scrolling behaviour of Dialog and Drawer components (update the admin UI to consume this fix)

> I'm really sorry if this sets the expectation that all these posts will rhyme
