const groups = [...require('./create'), ...require('./create-related'), ...require('./query')];

(async () => {
  for (let i = 0; i < groups.length; i++) {
    await groups[i].runFixtures();
  }
})();
