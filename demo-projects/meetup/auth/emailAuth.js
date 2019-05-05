const { startAuthedSession, endAuthedSession } = require('@keystone-alpha/session');
const bodyParser = require('body-parser');
const emailAuthRouter = require('express').Router();

module.exports = function createEmailAuthRoutes(keystone) {
  emailAuthRouter.post(
    '/signin',
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    async (req, res, next) => {
      // Cleanup any previous session
      await endAuthedSession(req);

      try {
        const result = await keystone.auth.User.password.validate({
          identity: req.body.email,
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
  return emailAuthRouter;
};
