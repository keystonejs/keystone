const passport = require('passport');
const PassportTwitter = require('passport-twitter');
const { Text, Relationship } = require('@keystone-alpha/fields');

const FIELD_TWITTER_ID = 'twitterId';
const FIELD_TWITTER_USERNAME = 'twitterUsername';
const FIELD_TOKEN_SECRET = 'tokenSecret';
const FIELD_ITEM = 'item';

function validateWithTwitter(strategy, token, tokenSecret) {
  return new Promise((resolve, reject) => {
    strategy.userProfile(token, tokenSecret, {}, async (error, data) => {
      if (error) {
        return reject(error);
      }

      resolve(data._json);
    });
  });
}

class TwitterAuthStrategy {
  constructor(keystone, listKey, config) {
    this.keystone = keystone;
    this.listKey = listKey;
    this.config = {
      idField: 'twitterId',
      usernameField: 'twitterUsername',
      sessionListKey: 'TwitterSession',
      ...config,
    };

    if (!this.getSessionList()) {
      // TODO: Set read permissions to be 'internal' (within keystone) only so
      // it doesn't expose a graphQL endpoint, or can be read or modified by
      // another user
      // NOTE: This odesn't use the `req.session` mechanism as it stores a
      // token secret which should not exist in the session store for security
      // reasons
      this.keystone.createList(this.config.sessionListKey, {
        fields: {
          [FIELD_TWITTER_ID]: { type: Text },
          [FIELD_TWITTER_USERNAME]: { type: Text },
          [FIELD_TOKEN_SECRET]: { type: Text },
          [FIELD_ITEM]: {
            type: Relationship,
            ref: this.listKey,
          },
          /* TODO
          verifiedAt: { type: Datetime },
          valid: { type: Bool, default: false },
          */
        },
      });
    }

    this.passportStrategy = new PassportTwitter(
      {
        consumerKey: this.config.consumerKey,
        consumerSecret: this.config.consumerSecret,
        callbackURL: this.config.callbackURL,
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
      async (req, token, tokenSecret, oauthParams, profile, done) => {
        try {
          let result = await this.keystone.auth.User.twitter.validate({
            token,
            tokenSecret,
          });
          if (!result.success) {
            // false indicates an authentication failure
            return done(null, false, { ...result, profile });
          }
          return done(null, result.item, { ...result, profile });
        } catch (error) {
          return done(error);
        }
      }
    );

    passport.use(this.passportStrategy);

    this.config.server.app.use(passport.initialize());
  }
  getList() {
    return this.keystone.lists[this.listKey];
  }
  getSessionList() {
    return this.keystone.lists[this.config.sessionListKey];
  }
  async validate({ token, tokenSecret }) {
    const jsonData = await validateWithTwitter(this.passportStrategy, token, tokenSecret);

    // Lookup a past, verified session, that links to a user
    let pastSessionItem;
    let fieldItemPopulated;
    try {
      // NOTE: We don't need to filter on verifiedAt as these rows can only
      // possibly exist after we've validated with Twitter (see above)
      pastSessionItem = await this.getSessionList().adapter.findOne({
        [FIELD_TWITTER_ID]: jsonData.id_str,
      });
      // find user item related to past session, join not possible atm
      fieldItemPopulated =
        pastSessionItem &&
        (await this.getList().adapter.findById(pastSessionItem[FIELD_ITEM].toString()));
    } catch (sessionFindError) {
      // TODO: Better error message. Why would this fail? DB connection lost? A
      // "not found" shouldn't throw (it'll just return null).
      throw new Error(`Unable to lookup existing Twitter sessions: ${sessionFindError}`);
    }

    const newSessionData = {
      [FIELD_TOKEN_SECRET]: tokenSecret,
      [FIELD_TWITTER_ID]: jsonData.id_str,
      [FIELD_TWITTER_USERNAME]: jsonData.screen_name,
    };

    // Only add a reference to the parent list when we know the link exists
    if (pastSessionItem) {
      newSessionData[FIELD_ITEM] = fieldItemPopulated.id;
    }

    const sessionItem = await this.keystone.createItem(this.config.sessionListKey, newSessionData);

    const result = {
      success: true,
      list: this.getList(),
      twitterSession: sessionItem.id,
    };

    if (!pastSessionItem) {
      // If no previous twitterSession found...
      // Create a new Twitter session that doesn't like to an item yet
      return {
        ...result,
        newUser: true,
      };
    }

    const previouslyVerifiedItem = fieldItemPopulated;
    return {
      ...result,
      item: previouslyVerifiedItem,
    };
  }

  pauseValidation(req, { twitterSession }) {
    if (!twitterSession) {
      throw new Error('Expected a twitterSession (ID) when pausing authentication validation');
    }
    // Store id in the req.session so it persists across requests (while they
    // potentially fill out a mutli-step form)
    req.session.keystoneTwitterSessionId = twitterSession;
  }

  async connectItem(req, { item }) {
    if (!item) {
      throw new Error('Must provide an `item` to connect to a twitter session');
    }

    if (!req) {
      throw new Error('Must provide `req` when connecting a Twitter Session to an item');
    }

    const twitterSessionId = req.session.keystoneTwitterSessionId;

    if (!twitterSessionId) {
      throw new Error(
        "Unable to extract Twitter Id from session. Maybe `pauseValidation()` wasn't called?"
      );
    }

    try {
      const twitterItem = await this.getSessionList().adapter.update(twitterSessionId, {
        item: item.id,
      });

      await this.getList().adapter.update(item.id, {
        [this.config.idField]: twitterItem[FIELD_TWITTER_ID],
        [this.config.usernameField]: twitterItem[FIELD_TWITTER_USERNAME],
      });
    } catch (error) {
      return { success: false, error };
    }
    return { success: true, item, list: this.getList() };
  }

  /**
   * Express Middleware to trigger the Twitter login flow (OAuth 1.0a)
   *
   * @param sessionExists {Function(itemId, req, res, next)}
   * Called when an existing session is detected (twitter or otherwise).
   * If not provided, will call `next()` directly, skipping Twitter login flow.
   */
  loginMiddleware({ sessionExists }) {
    return (req, res, next) => {
      if (req.session.keystoneItemId) {
        if (sessionExists) {
          return sessionExists(req.session.keystoneItemId, req, res, next);
        } else {
          next();
        }
      }

      // If the user isn't already logged in
      // kick off the twitter auth process
      passport.authenticate('twitter', { session: false })(req, res, next);
    };
  }

  /**
   * Express Middleware to handle Twitter's response to the OAuth flow.
   *
   * @param failedVerification {Function(error<String>, req, res, next)}
   * Called when we can't verifiy the user details with Twitter. Shouldn't happen
   * in normal operation, however can be an attack vector upon the authentication
   * process. Default: calls `next()`, skipping the rest of the auth flow.
   */
  authenticateMiddleware({ failedVerification, verified }) {
    if (!failedVerification) {
      throw new Error('Must supply a `failedVerification` function to `authenticateTwitterUser()`');
    }
    if (!verified) {
      throw new Error('Must supply a `verified` function to `authenticateTwitterUser()`');
    }

    return (req, res, next) => {
      // This middleware will call the `verify` callback we passed up the top to
      // the `new PassportTwitter` constructor
      passport.authenticate('twitter', async (verifyError, authedItem, info) => {
        // If we get a error, bail and display the message we get
        if (verifyError) {
          return failedVerification(verifyError.message || verifyError.toString(), req, res, next);
        }
        // If we don't authorise Twitter we won't have any info about the
        // user so we need to bail
        if (!info) {
          return failedVerification(null, req, res, next);
        }
        // Otherwise, store the Twitter data in session so we can refer
        // back to it
        try {
          await this.keystone.auth.User.twitter.pauseValidation(req, info);

          await verified(authedItem, info, req, res, next);
        } catch (validationVerificationError) {
          next(validationVerificationError);
        }
      })(req, res, next);
    };
  }
}

TwitterAuthStrategy.authType = 'twitter';

module.exports = TwitterAuthStrategy;
