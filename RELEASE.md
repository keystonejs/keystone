# Release Process

These instructions capture the internal process for making releases of the Keystone packages.

## npm release

Merge the PR named `Version Packages` into `main` on GitHub once tests are passing.

In the command line, run `git pull` to fetch latest changes from `main`.

Run `yarn fresh` to rebuild `node_modules` and clean-up any build output.

Finally, run `yarn publish-changed` to find packages where the version listed in the `package.json` is ahead of the version published on npm, and publish just those packages.

The above command requires OTP and publish privileges on npm.

Create git tag relevant to release date, such as `git tag "$(date +'%Y-%m-%d')"`.

Then publish all new tags (releases plus release date version) to GitHub with `git push --tags`.

Copy the successful output of the published packages from the above npm release, example output:

```sh
@keystone-6/auth@1.0.0
@keystone-6/fields@1.0.0
@keystone-6/core@1.0.0
```

Translate to a `package.json` style syntax for ease of copying, example:

```json
"@keystone-6/auth": "1.0.0",
"@keystone-6/fields": "1.0.0",
"@keystone-6/core": "1.0.0",
```

You can safely remove references to `@keystone-ui` as they are primarily for internal use in the Admin UI.

Use this output in the next step.

## Website release

Create a new branch off `website_live`, name it something like `2021-11-02-release-notes`

Duplicate the last release notes for this release under `/docs/pages/releases/YYYY-MM-DD.mdx`.

Copy over the PR content you've processed from the above section under the `## What's New` heading.

Group items and add headings to call out sections to have the release start to take shape, add in `>` quotes as editors notes for ideas on topics.

Open a PR against `website_live` with this branch to allow others to review when there is an overall story.

Finalise content based on feedback, clean up text, add emojis.

Make sure the `Complete Changelog` section has valid links to the latest release.

Publish release on GitHub.

Add release to release page index under `/docs/pages/releases/index.mdx` with a summarised heading.

Commit your changes; have them reviewed, then merged into `website_live` from the above PR.

## Github release notes

Create a draft release on GitHub based on the above tag (such as 2021-11-02) with the following template.

Update the following:

-   Summary headline of what's in the release (can be updated later)
-   The Keystone website link
-   Packages output
-   Verbose release notes link

````
[summary headline]

### **View the [complete release notes on the Keystone website](https://keystonejs.com/releases/YYYY-MM-DD)**.

```sh
"keystone-next/keystone": "x.x.x",
[place the copied output here]
```

## Enjoying Keystone?

Star this repo 🌟 ☝️ or connect to Keystone on [Twitter](https://twitter.com/KeystoneJS) and in [Slack](http://community.keystonejs.com/).

## Changelog

Aside from the [complete release notes on the Keystone website](https://keystonejs.com/releases/YYYY-MM-DD), you can also view the [verbose change log](https://github.com/keystonejs/keystone/pull/XXXX) in the related PR (https://github.com/keystonejs/keystone/pull/XXXX) for this release.
````

## Website release notes

Retrieve release notes from the `Version Packages` PR to format.

Strip out reference at top relating to `Changesets release` comment.

Remove `# Releases` heading.

Remove all `Major changes`, `Minor changes` and `Patch changes` headings.

Remove all `## @keystone-next` prefixed headings.

Remove all `## @keystone-ui` prefixed headings.

Remove all lines related to `Updated dependencies` logs.

There should be nothing left except lines referencing PRs with a `- [#xxxx]` prefix.

Remove any duplicate PR descriptions.

Remove all git hash references, such as:

```sh
[`7eabb4dee`](https://github.com/keystonejs/keystone/commit/7eabb4dee2552f7baf1e0024d82011b179d418d4)
```

Remove all `Thanks @user!` references unless it is from a community member, note these down to mention in credits.

Go through PR descriptions and determine what should be called out in the release, what should be summarised, or left out completely.

## GitHub branch sync

When we do a release we need to make sure `main` and `website_live` are both in sync with each other.

This can be done by checking out `website_live`.

Then running `git rebase --interactive origin/main`.

Resolve any conflicts then run `git push --force`.

The `website_live` branch should no longer be behind in commits on the branches page <https://github.com/keystonejs/keystone/branches>.

Finally, create a PR to merge `website_live` into `main`, and merge it via `Rebase and merge` so the commits aren't lost and to keep `main` up to date with `website_live`.
