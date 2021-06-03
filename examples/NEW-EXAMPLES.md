> ⚠️   Note: we're not accepting public contributions just yet, but you will be able to soon. To learn more reach out in the [Community Slack](https://community.keystonejs.com/)

## Adding Examples

These docs are for developers who want to add new example projects to the Keystone repository.

If you're looking for instructions on how to use the examples, please consult the [README](./README.md).

### Types of examples

There are three types of example project:

- Base Projects: We have two of these, a blog and a task manager. We don't need any more of these
- Feature Projects: Should be built off a base, and be a minimal demonstration of how to use a specific feature.
  They should only include what is needed to show off the feature, and should not become "kitchen sink" demos.
- Solution Projects: Should be a complete demonstration of a solution such as an e-commerce project.
  These projects combine a collection of features in a cohesive way that makes sense for the use case.

### Feature Example steps

1. Decide which base project to use. This is up to you, and will depend on what feature you're trying to demonstrate and where it makes most contextual sense to add it.
2. Create a new project directory: `cd examples; cp -R task-manager <example-name>`.
3. Add to git; `git add <example-name>`
4. Edit `package.json` for the new project. You'll need to update `name`, set `version` to `0.0.0`, and edit the `repository` link.
5. Edit `CHANGELOG.md` for the new project. Clear out everything except the top level heading. Update top level heading to match the package name
6. Edit `README.md` for the new project. Document what you expect to be showing off here. This will help act as a spec. We will loop back to this once we’re done to make sure it makes sense, but writing it up front helps frame the work.
7. Make sure your base example runs. `cd <example-name>; yarn dev`.
8. Add a changeset with the initial major version of the example. `cd ../..; yarn changeset - major “Initial version of the <example-name> example.”`
9. [Draw the rest of the owl](https://knowyourmeme.com/memes/how-to-draw-an-owl). Write and test your example, making sure that it's clearly commented.
10. Add a smoke test to ensure your example is executed on CI.
11. Update the `examples/README.md` with a link to your new example.
12. Submit a PR for review.
