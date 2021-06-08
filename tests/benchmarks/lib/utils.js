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

const fixture = async (runner, fn) => {
  await runner(args => fn({ ...args, provider: process.env.TEST_ADAPTER }));
};
const range = N =>
  Array(N)
    .fill()
    .map((_, i) => i);

const populate = (N, f) => range(N).map(i => f(i));

class FixtureGroup {
  constructor(runner) {
    this.runner = runner;
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
      await fixture(this.runner, fixturesToRun[i].fn);
    }
    return true;
  }
}

module.exports = { timeQuery, FixtureGroup, populate, range };
