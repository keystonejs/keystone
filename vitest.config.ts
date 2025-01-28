import { defineConfig } from 'vitest/config'

export default defineConfig({
  
  test: {
    globals: true,
    exclude: [
      '**/node_modules/**',
      'tests/api-tests',
      'tests/admin-ui-tests',
      'tests/examples-smoke-tests',
      'tests/cli-tests',
      'examples/testing',
      'packages/core/tests/telemetry.test.ts'
    ],
  },
})
