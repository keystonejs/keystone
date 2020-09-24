# Auth TODO

- [ ] Get everything actually working again @mitchell
- [x] Validate config in createAuth (e.g identityField and secretField exist on the list) @mitchell
- [x] Implement graphQLSchemaExtension properly based on config @mitchell
- [x] Secure Admin paths with `secureFn` if it is provided @mitchell
  - [x] Except `publicRoutes`
  - [x] Implement no access UI
  - [x] Make no access UI look nice @jed
- [x] Put generating Auth Admin UI Pages in the package, add them with `getAdditionalFiles` @mitchell
- [ ] Load Admin Meta from an API route @mitchell
  - [ ] With good HTTP caching headers
  - [ ] Protect it with the `secureFn`
  - [ ] Make it synchronously available on all pages
- [ ] Write `withItemData` wrapper for sessions @noviny
  - [ ] Session functions will need enough API to execute a query
- [x] Pass session in context as `session` @mitchell
  - [ ] Remove `authentication` property from context and the usages of it
  - [ ] Pass this as an arg on access control? -- yes
- [ ] Implement signout @jed
  - [x] Only generate the endSession mutation if session.end exists
  - [ ] Create UI for the signout page
  - [ ] Only generate the signout page if the config is enabled
  - [ ] Add a signout button to the Admin UI when the config is enabled
- [ ] Implement forgotten password & magic links @molomby
  - [ ] Define the list
  - [ ] Add the mutations
  - [ ] Generate the UI if it is enabled
  - [ ] Wire up the UI
- [ ] Implement init first user @mitchell
  - [ ] Generate the UI if it is enabled
  - [ ] Add the check for (no users?) => redirect
  - [ ] Lock down with (any users?) => nope
  - [ ] Correctly render the field views for the fields defined
  - [ ] Create the user
  - [ ] Add second screen for following / subscribing to Keystone
  - [ ] Set up something somewhere for us to collect the data
- [ ] Write documentation for createAuth @molomby

# Backlog

- [ ] Review the API that session functions get, try not to provide the keystone instance
- [ ] 2FA
- [ ] Social Auth
