const keystone = require('@keystone-alpha/core');
const { startAuthedSession, endAuthedSession } = require('@keystone-alpha/session');
const bodyParser = require('body-parser');

const { port, staticRoute, staticPath } = require('./config');

const initialData = require('./data');

keystone
  .prepare({ port })
  .then(async ({ server, keystone: keystoneApp }) => {
    await keystoneApp.connect();

    // Initialise some data.
    // NOTE: This is only for test purposes and should not be used in production
    const users = await keystoneApp.lists.User.adapter.findAll();
    if (!users.length) {
      Object.values(keystoneApp.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await keystoneApp.createItems(initialData);
    }

    server.app.get('/reset-db', async (req, res) => {
      Object.values(keystoneApp.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await keystoneApp.createItems(initialData);
      res.redirect('/admin');
    });

    server.app.get('/api/session', (req, res) => {
      const data = {
        signedIn: !!req.session.keystoneItemId,
        userId: req.session.keystoneItemId,
      };
      if (req.user) {
        data.name = req.user.name;
      }
      res.json(data);
    });

    server.app.post(
      '/signin',
      bodyParser.json(),
      bodyParser.urlencoded({ extended: true }),
      async (req, res, next) => {
        // Cleanup any previous session
        await endAuthedSession(req);

        try {
          const result = await keystoneApp.auth.User.password.validate({
            identity: req.body.username,
            secret: req.body.password,
          });
          if (!result.success) {
            return res.json({
              success: false,
            });
          }
          await startAuthedSession(req, result);
          res.json({
            success: true,
            itemId: result.item.id,
            token: req.sessionID,
          });
        } catch (e) {
          next(e);
        }
      }
    );

    server.app.get('/signout', async (req, res, next) => {
      try {
        await endAuthedSession(req);
        res.json({
          success: true,
        });
      } catch (e) {
        next(e);
      }
    });

    server.app.use(staticRoute, server.express.static(staticPath));

    await server.start();
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
