export default function ({
  identityField,
  passwordField,
}: {
  identityField: string
  passwordField: string
}) {
  return `import makeSigninPage from '@keystone-6/auth/pages/SigninPage'

export default makeSigninPage(${JSON.stringify({
    identityField,
    passwordField,
  })})
`
}
