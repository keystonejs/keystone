// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import stylisticTs from '@stylistic/eslint-plugin-ts'

export default tseslint.config(
  {
    ignores: [
      '**/.keystone/',
      '**/.next/',
      '**/dist/',
      '**/__generated__/',
      '**/node_modules/',
      '**/syntax-error.js',
      '**/public/',
      'examples/',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    plugins: {
      '@stylistic/ts': stylisticTs,
    },
    rules: {
      // TODO: remove
      'no-empty': 'off',
      'prefer-const': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-require-imports': 'off', // TODO: always
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
      '@stylistic/ts/member-delimiter-style': [
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
      '@stylistic/ts/semi': ['error', 'never'],
    }
  }
)
