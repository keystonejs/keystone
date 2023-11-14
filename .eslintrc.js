/* eslint-env node */
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  overrides: [{
    files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
  }],
  rules: {
    '@typescript-eslint/consistent-type-imports': ['error', {
      disallowTypeAnnotations: true,
      fixStyle: 'inline-type-imports',
      prefer: 'type-imports',
    }],
  }
}
