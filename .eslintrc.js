/* eslint-env node */
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  overrides: [{
    files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
  }],
  rules: {
    'block-spacing': ['error', 'always'],
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'comma-spacing': ['error', { before: false, after: true }],
    'func-call-spacing': ['error', 'never'],
    'semi-spacing': ['error', { before: false, after: true }],
    'space-before-blocks': ['error', 'always'],
    'space-before-function-paren': ['error', 'always'],
    'space-before-function-paren': ['error', 'always'],
    'space-in-parens': ['error', 'never'],
  }
}
