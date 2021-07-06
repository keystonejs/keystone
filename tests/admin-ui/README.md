# Admin UI Tests

Keystone, as a system, can be summarised as `schema => ({ api, adminUI })`.
This directory contains integration test to ensure that `schema => ({ adminUI })` behaves as expected.
All integration tests in this repo are run using [playwright](https://playwright.dev/).

# How to run

To run these tests please run the `yarn test:admin-ui` script from the root of the Keystone monorepo.
If you would like more explicit logging from playwright, please run `VERBOSE=true yarn test:Admin-ui`.

# How to write

(coming soon)

# Connecting to CI

(coming soon)
