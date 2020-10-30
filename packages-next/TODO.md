# Major work left to release the next packages

- [x] Make it work for JS
- [ ] Test package installs with local registry (use pnpm first to find missing deps)
- [ ] Make sure we have the right peerDeps
- [ ] Publish the packages to a preview scope (`@keystone-next`)
- [ ] Clean up stable set of features
  - [ ] Custom views @mitchell
  - [x] Unbreak the date field @mitchell
  - [ ] Create mode for Passwords @jed
  - [x] Validate create initial item form @mitchell
  - [ ] No items display on the List screen @jed
  - [x] Always hide virtual fields in the create form
  - [x] Special case validation errors and display them nicely @mitchell
- [ ] Figure out how it works in prod
  - [ ] Server (e.g Heroku)
  - [ ] Serverless (e.g Vercel / Lambda)
  - [ ] Deploying GraphQL API and Admin UI independently
- [ ] Plan updated set of field types
- [ ] Review example projects / clean up, etc
- [ ] Plan documentation / website

---

## Next steps after alpha release

- [ ] Review how we're returning errors from the GraphQL API
- [ ] Review how the search field (and query input) works
- [ ] Revisit design system and theming
