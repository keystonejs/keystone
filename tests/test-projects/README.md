## ATTENTION

This folder contains projects used for Cypress tests. You do not want to use these as starting points for your own project. You are better off using the example projects for that, which are located in `/examples`.

## Cypress Projects

Each directory here is part of the Yarn Workspaces monorepo, and represents a single
runnable project which tests can be run against.

This is to help with unique setups (eg; testing mongo vs postgres, etc).

Think very carefully before you create new projects, as you may find it's
easier/faster/better to add a new List to an existing test project if possible.

### Environment Variables

Make sure that for each project (eg `tests/test-projects/basic`), you setup the `.env` file
with the necessary values filled out (see `.env.example` for what's required).

### Continuous Integration

When creating a new project, it must be added to the CI config.

Look in `.circleci/config.yml` for examples, and copy one of those.
Be sure to setup the correct environment variables too.
