- Removed the `<adminPath>/signin`, `<adminPath>/signout`, and
  `<adminPath>/session` routes.
    - The REST routes have been replaced with GraphQL mutations
      `authenticate<List>With<Strategy>` & `unauthenticate<List>` (see
      `@keystone-alpha/keystone`'s `CHANGELOG.md` for details)
- Admin UI now uses the new `(un)authenticate` mutations for sigin/signout
  pages.
- Signout page correctly renders again (previously was erroring and showing a
  blank page)
- Generate Admin UI login form field labels based on the identity and secret
  fields set in the PasswordAuthStrategy.
