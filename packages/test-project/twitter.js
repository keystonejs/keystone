const TwitterAuthStrategy = require('@keystonejs/core/auth/Twitter');

const passport = require('passport');
const PassportTwitter = require('passport-twitter');

const { twitterAppKey, twitterAppSecret, port } = require('./config');

exports.createTwitterAuthStrategy = function(keystone) {
  passport.use(
    new PassportTwitter(
      {
        consumerKey: twitterAppKey,
        consumerSecret: twitterAppSecret,
        callbackURL: `http://localhost:${port}/auth/twitter/callback`,
        passReqToCallback: true,
      },
      /**
       * from: https://github.com/jaredhanson/passport-oauth1/blob/master/lib/strategy.js#L24-L37
       * ---
       * Applications must supply a `verify` callback, for which the function
       * signature is:
       *
       *     function(token, tokenSecret, oauthParams, profile, done) { ... }
       *
       * The verify callback is responsible for finding or creating the user, and
       * invoking `done` with the following arguments:
       *
       *     done(err, user, info);
       *
       * `user` should be set to `false` to indicate an authentication failure.
       * Additional `info` can optionally be passed as a third argument, typically
       * used to display informational messages.  If an exception occured, `err`
       * should be set.
       */
      async function verify(
        req,
        token,
        tokenSecret,
        oauthParams,
        profile,
        done
      ) {
        try {
          let result = await keystone.auth.User.twitter.validate({
            token,
            tokenSecret,
          });
          if (!result.success) {
            // false indicates an authentication failure
            return done(null, false, result);
          }
          return done(null, result.item, result);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  keystone.createAuthStrategy({
    type: TwitterAuthStrategy,
    list: 'User',
    config: {
      key: process.env.TWITTER_APP_KEY,
      secret: process.env.TWITTER_APP_SECRET,
      idField: 'twitterId',
      usernameField: 'twitterUsername',
    },
  });
};

exports.createTwitterAuthStrategy = function(keystone, server) {
  server.app.use(passport.initialize());
  // Hit this route to start the twitter auth process
  server.app.get('/auth/twitter', (req, res, next) => {
    if (req.session.keystoneItemId) {
      // logged in already? Send 'em home!
      return res.redirect('/api/session');
    }

    // If the user isn't already logged in
    // kick off the twitter auth process
    passport.authenticate('twitter', { session: false })(req, res, next);
  });

  // Twitter will redirect the user to this URL after approval.
  server.app.get('/auth/twitter/callback', (req, res, next) => {
    // This middleware will call the `verify` callback we passed up the top to
    // the `new PassportTwitter` constructor
    passport.authenticate('twitter', async (verifyError, authedItem, info) => {
      if (verifyError) {
        return res.json({
          success: false,
          // TODO: Better error
          error: verifyError.message || verifyError.toString(),
        });
      }

      try {
        if (!authedItem) {
          if (info.newUser) {
            // Twitter authed, but no known user
            // TODO: Trigger "new user" flow and somehow store the authed twitter
            // token/id on the session so it's available across multiple requests
            const newItem = await keystone.createItem(info.list.key, {});

            await keystone.auth.User.twitter.connectItem({
              twitterSession: info.twitterSession,
              item: newItem,
            });
            await keystone.session.create(req, {
              item: newItem,
              list: info.list,
            });

            res.redirect('/api/session');
          } else {
            // Really, this condition shouldn't be possible
            throw new Error(
              'Twitter login could not find an existing user, or create a twitter session. This is bad.'
            );
          }
        } else {
          // TODO: Test
          await keystone.session.create(req, info);
          res.redirect('/api/session');
        }
      } catch (createError) {
        res.json({
          success: false,
          // TODO: Better error
          error: createError.message || createError.toString(),
        });
      }
    })(req, res, next);
  });
};
