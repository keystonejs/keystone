> ⚠️   Note: we're not accepting public contributions just yet, but you will be able to soon. To learn more reach out in the [Community Slack](https://community.keystonejs.com/)

## Adding Examples

These docs are for developers who want to add new example projects to the Keystone repository.

If you're looking for instructions on how to use the examples, please consult the [README](./README.md).

### Types of examples

There are two types of examples:

- Feature Examples: Standalone keystone examples that demonstrate specific use cases. These should only include what is needed to show off the feature, and should not become "kitchen sink" demos.
- E2E Examples: These examples showcase how Keystone works with other tools and frameworks and usually have a separate frontend and keystone setup that need to run simultaneously for the example to work.

### Steps to create an example

1. Copy paste either `examples/feature-boilerplate` or `examples/e2e-boilerplate` and rename the copy into your example name. Eg. `examples/my-new-example`.
2. Edit `package.json` for the new project. You'll need to update `name`, set `version` to `0.0.1`, and edit the `repository` link.
3. Edit `CHANGELOG.md` for the new project. Clear out everything except the top level heading. Update top level heading to match the package name.
4. Edit `README.md` for the new project. Document what you expect to be showing off here. This will help act as a spec. We will loop back to this once we’re done to make sure it makes sense, but writing it up front helps frame the work. For feature examples, make sure you update the codesandbox link in the readme _Try it out in CodeSandbox 🧪_ section.
5. Make sure your example runs. `cd <example-name>; yarn dev`.
6. Add a smoke test to ensure your example is executed on CI. You will need to edit the `examples_smoke_tests` block in `tests.yml`
7. Update the `examples/README.md` with a link to your new example.
8. Submit a PR for review.
9. Once your PR is merged, update the branch protection rules on `main` to require the new smoke test
10. (For feature examples only) After merge, make sure your example deploys to codesandbox by clicking the _View in codesandbox_ link in the `README.md` _Try it out in CodeSandbox 🧪_ section.
