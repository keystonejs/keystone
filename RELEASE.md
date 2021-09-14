# Release Process

These instructions capture the internal process for making releases of the Keystone packages.

## npm release

Merge the PR named `Version Packages` into `master` on GitHub once tests are passing.

Get latest from `master`:

```sh
git pull
```

Rebuild `node_modules` and clean-up any build output:

```sh
yarn fresh
```

Find packages where the version listed in the `package.json` is ahead of the version published on npm, and attempt to publish just those packages, requires OTP and publish privileges on npm:

```sh
yarn publish-changed
```

## GitHub tags

Publish all new tags to GitHub:

```sh
git push --tags
```

Checkout merge commit as a result of the `Version Packages` PR:

```sh
git checkout sha123
```

Create git tag relevant to release date:

```sh
git tag -a "YYYY-MM-DD" -m "YYYY-MM-DD"
```

Push tag to GitHub:

```sh
git push --tags
```

## Github release

Create draft release on GitHub based on the above tag to fill with template below:

```
## What's New

[commentary about release here with headings and examples]

## Enjoying Keystone?

Star this repo 🌟 ☝️ or connect to Keystone on [Twitter](https://twitter.com/KeystoneJS) and in [Slack](http://community.keystonejs.com/).

---

<details>
<summary>View verbose release notes</summary>

# Releases

[verbose notes here copied verbatim from the `Version Packages` PR]
```

Copy the successful output of the published packages from above npm release, example output:

```sh
@keystone-next/admin-ui-utils@5.0.2
@keystone-next/auth@27.0.0
@keystone-next/cloudinary@6.0.0
@keystone-next/fields-document@7.0.0
@keystone-next/fields@11.0.0
@keystone-next/keystone@20.0.0
@keystone-next/test-utils-legacy@21.0.0
@keystone-next/types@20.0.0
@keystone-next/utils-legacy@12.0.0
@keystone-ui/core@3.1.0
@keystone-ui/fields@4.1.1
@keystone-ui/segmented-control@4.0.1
```

Convert to a `package.json` style syntax for ease of copying, example conversion:

```sh
"@keystone-next/admin-ui-utils": "5.0.2",
"@keystone-next/auth": "27.0.0",
"@keystone-next/cloudinary": "6.0.0",
"@keystone-next/fields-document": "7.0.0",
"@keystone-next/fields": "11.0.0",
"@keystone-next/keystone": "20.0.0",
"@keystone-next/test-utils-legacy": "21.0.0",
"@keystone-next/types": "20.0.0",
"@keystone-next/utils-legacy": "12.0.0",
"@keystone-ui/core": "3.1.0",
"@keystone-ui/fields": "4.1.1",
"@keystone-ui/segmented-control": "4.0.1",
```

Place this directly under the `## What's New` heading.

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

Copy all unique PR descriptions into template under the `## What's New` heading.

Group items and add headings to call out sections to have the release start to take shape, add in `>` quotes as editors notes for ideas on topics.

Publish a draft when there is an overall story and get others to review.

Finalise content based on feedback, clean up text, add emojis.

Copy original description from `Version Packages` to the `View verbose release notes` section.

Publish release on GitHub.

## Website release

Add a new release page to website for this release under `/docs/pages/releases/YYYY-MM-DD.mdx` using the same format as previous release.

Copy over the GitHub markdown content from the GitHub release into this document (excluding verbose notes).

Add release to release page index under `/docs/pages/releases/index.mdx` with a summarised heading.

Commit website update and open PR to add to `master`.

Have PR reviewed and merged into `master`.

## GitHub branch sync

When we do a release we need to make sure `master` and `website_live` are both in sync with each other, this is done by:

Creating a branch off `master` such as `bring-in-latest-website-changes` and merging in `website_live` changes, opening a PR and getting it merged, example - <https://github.com/keystonejs/keystone/pull/6470>

Then the other way around, create a branch off `website_live` such as `bring-in-latest-master-changes`, and merging in `master` changes, opening a PR and getting it merged, example - <https://github.com/keystonejs/keystone/pull/6472>

Once this is done, the histories will be out of sync, GitHub will state that `website_live` is still x commits behind, if you look at the branches page - <https://github.com/keystonejs/keystone/branches>

To resolve this in the CLI:

Go to the `website_live` branch

`git checkout website_live`

Check that we're identical to master

`git diff master`

Do a merge that should just update the parents of the new commit

`git merge master`

This should be empty

`git diff origin/website_live`

This should be empty

`git diff master`

Force push `website_live` (after turning off branch protection in github)

`git push --force`

Branches should now be nicely aligned.
