import '@testing-library/jest-dom';
// `mongodb-memory-server` downloads a binary on first run in CI, which can take
// a while, so we bump up the timeout here.
jest.setTimeout(60000); // in milliseconds
