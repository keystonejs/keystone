const keystone = require('@keystone-alpha/core');
const path = require('path');
const PORT = process.env.PORT || 3000;

// Keystone will prepare the Admin UI (if configured in index.js) and GraphQL
// APIs here.
keystone
  .prepare({
    entryFile: 'index.js',
    port: PORT,
  })
  // 'server' is an express instance, to which you can attach your own routes,
  // middlewares, etc.
  .then(({ server }) => {
    // In this project, we attach a single route handler for `/public` to serve
    // our app
    server.app.use(server.express.static(path.join(__dirname, 'public')));
    // Finally, we must start the server so we can access the Admin UI and
    // GraphQL API
    return server.start();
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
