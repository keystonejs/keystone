export default {
  collectCoverageFrom: [
    'packages/**/*.{js,ts,tsx}',
    '!**/*.d.ts',
    '!packages/**/dist/**',
    '!packages/core/src/fields/**/test-fixtures.{js,ts}',
  ],
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  transformIgnorePatterns: ['/node_modules/(?!(package-up|@prisma))/'],
  transform: {
    '^.+\\.[tj]sx?$': [
      'esbuild-jest',
      {
        target: 'esnext',
      },
    ],
  },
}
