# Admin UI Tests

Keystone, as a system, can be summarised as `schema => ({ api, adminUI })`.
This directory contains integration test to ensure that `schema => ({ adminUI })` behaves as expected.
All integration tests in this repo are run using [playwright](https://playwright.dev/).

# How to run

To run these tests locally please run the `DATABASE_URL=file:./test.db yarn test:admin-ui` script from the root of the Keystone monorepo.
If you would like more explicit logging from playwright, please run `DEBUG=pw:api yarn test:admin-ui`.

# How to write

(coming soon)

# Connecting to CI

If you're just adding a new test to an existing file you can ignore this section.
If, however you've created a new test file within this repo, please ensure that CI is made aware of this.

In order to do so, please add the file name to the array of file names in the `.github/workflows/tests.yml` test matrix under the `admin_ui_integration_tests` section like so

```yml
strategy:
  matrix:
    test: ['init.test.ts', ADD_YOUR_FILENAME_HERE]
    fail-fast: false
```

Remember to commit this change and validate that the tests are running remotely.
Once your PR is merged, update the branch protection rules on `master` to require the admin UI test.
