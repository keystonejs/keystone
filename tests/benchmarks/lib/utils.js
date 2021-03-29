const { multiAdapterRunners } = require('@keystone-next/test-utils-legacy');

const timeQuery = async ({ context, query, variables, repeat = 1 }) => {
  const t0_us = process.hrtime.bigint();
  const allErrors = [];
  for (let i = 0; i < repeat; i++) {
    try {
      await context.graphql.run({ query, variables });
    } catch (error) {
      allErrors.push(error);
    }
  }
  const t1_us = process.hrtime.bigint();
  if (allErrors.length) {
    console.log(allErrors);
  }
  return { time: Number(t1_us - t0_us) / 1e9, success: !allErrors.length };
};

const fixture = async (setupKeystone, fn) => {
  const subfixtures = multiAdapterRunners().map(({ runner, adapterName }) =>
    runner(setupKeystone, args => fn({ ...args, adapterName }))
  );
  for (let i = 0; i < subfixtures.length; i++) {
    await subfixtures[i]();
  }
};
const range = N =>
  Array(N)
    .fill()
    .map((_, i) => i);

const populate = (N, f) => range(N).map(i => f(i));

class FixtureGroup {
  constructor(setupKeystone) {
    this.setupKeystone = setupKeystone;
    this.fixtures = [];
  }

  add({ fn, skip = false, only = false }) {
    this.fixtures.push({ fn, skip, only });
  }

  async runFixtures() {
    let fixturesToRun;
    const onlys = this.fixtures.filter(fixture => fixture.only);
    if (onlys.length) {
      fixturesToRun = onlys;
    } else {
      fixturesToRun = this.fixtures.filter(fixture => !fixture.skip);
    }
    for (let i = 0; i < fixturesToRun.length; i++) {
      await fixture(this.setupKeystone, fixturesToRun[i].fn);
    }
    return true;
  }
}

module.exports = { timeQuery, FixtureGroup, populate, range };
