const keystone = require('@keystone-alpha/core');
const path = require('path');
const PORT = process.env.PORT || 3000;

keystone
  .prepare({
    entryFile: 'index.js',
    port: PORT,
  })
  .then(async ({ server, keystone: keystoneApp }) => {
    await keystoneApp.connect(process.env.MONGODB_URI);

    server.app.use(server.express.static(path.join(__dirname, 'public')));
    return server.start();
  })
  .then(({ port }) => {
    console.log(`Listening on port ${port}`);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
