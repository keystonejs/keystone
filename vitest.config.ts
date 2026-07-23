import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 10_000,
    exclude: [...configDefaults.exclude, 'examples/testing/**', 'tests2/**'],
  },
})
