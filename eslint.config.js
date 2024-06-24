// @ts-check

const eslint = require('@eslint/js')
const tseslint = require('typescript-eslint')

module.exports = tseslint.config(
  {
    ignores: [
      '**/.keystone/',
      '**/dist/',
      '**/node_modules/',
      '**/syntax-error.js',
      '**/public/',
      'examples/extend-graphql-schema-nexus/nexus-types.ts'
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
//    ...tseslint.configs.stylistic,
  {
    rules: {
      // TODO: remove
      'no-empty': 'off',
      'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: true }],
      'no-extra-boolean-cast': 'off',
      'no-async-promise-executor': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      'prefer-const': 'off',
      'no-regex-spaces': 'off',
      'no-useless-escape': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/no-namespace': 'off',
      'import/no-unresolved': 'off',
      // TODO: remove

      semi: ['error', 'never'],
      quotes: ['error', 'single', { allowTemplateLiterals: true, avoidEscape: true }],
      'block-spacing': ['error', 'always'],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'comma-spacing': ['error', { before: false, after: true }],
      'func-call-spacing': ['error', 'never'],
      'no-undef': 'off', // https://typescript-eslint.io/troubleshooting/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      'semi-spacing': ['error', { before: false, after: true }],
      'space-before-blocks': ['error', 'always'],
      'space-before-function-paren': ['error', 'always'],
      'space-in-parens': ['error', 'never'],
      '@typescript-eslint/member-delimiter-style': [
        'error',
        {
          multiline: { delimiter: 'none' },
          singleline: { delimiter: 'comma', requireLast: false }
        }
      ],
      '@typescript-eslint/consistent-type-imports': ['error', {
        disallowTypeAnnotations: true,
        fixStyle: 'inline-type-imports',
        prefer: 'type-imports',
      }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-ts-expect-error': 'error',
      '@typescript-eslint/semi': ['error', 'never'],
    }
  }
)
