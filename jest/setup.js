// AVA-like test wrapper for known failing tests
// see: https://github.com/avajs/ava#failing-tests
test.failing = (title, testFn) => {
  if (typeof testFn !== 'function') {
    testFn = title;
    title = undefined;
  }

  test(title, async () => {
    try {
      await testFn();
    } catch (error) {
      // Test is expected to fail
      return;
    }
    throw new Error(
      `Expected test '${title}' to fail. If this previously failing case now passes, consider removing '.failing' from the test definition`
    );
  });
};
