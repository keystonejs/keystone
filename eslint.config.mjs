// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

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
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      'prefer-const': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-require-imports': 'off', // TODO: always
      'no-undef': 'off', // https://typescript-eslint.io/troubleshooting/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: true,
          fixStyle: 'separate-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-ts-expect-error': 'error',
    },
  }
)
