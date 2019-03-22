const keystone = require('@keystone-alpha/core');
const path = require('path');
const PORT = process.env.PORT || 3000;

keystone
  .prepare({
    entryFile: 'index.js',
    port: PORT,
  })
  .then(({ server }) => {
    server.app.use(server.express.static(path.join(__dirname, 'public')));
    return server.start();
  })
  .then(({ port }) => {
    console.log(`
      Success! Your application is available at:

      App URL: http://localhost:${port}
      Admin URL: http://localhost:${port}/admin
      GraphQL Playground: http://localhost:${port}/admin/graphiql
    `);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
