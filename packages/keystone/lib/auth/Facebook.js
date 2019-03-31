const passport = require('passport');
const PassportFacebook = require('passport-facebook');

const FIELD_FACEBOOK_ID = 'facebookId';
const FIELD_FACEBOOK_USERNAME = 'facebookUsername';
const FIELD_TOKEN_SECRET = 'tokenSecret';
const FIELD_ITEM = 'item';

function validateWithFacebook(strategy, accessToken) {
  return new Promise((resolve, reject) => {
    strategy.userProfile(accessToken, async (error, data) => {
      if (error) {
        return reject(error);
      }
      resolve(data._json);
    });
  });
}

class FacebookAuthStrategy {
  constructor(keystone, listKey, config) {
    this.keystone = keystone;
    this.listKey = listKey;
    this.config = {
      idField: 'facebookId',
      usernameField: 'facebookUsername',
      sessionListKey: 'FacebookSession',
      ...config,
    };

    if (!this.getSessionList()) {
      const { Text, Relationship } = require('@keystone-alpha/fields');

      // TODO: Set read permissions to be 'internal' (within keystone) only so
      // it doesn't expose a graphQL endpoint, or can be read or modified by
      // another user
      // NOTE: This odesn't use the `req.session` mechanism as it stores a
      // token secret which should not exist in the session store for security
      // reasons
      this.keystone.createList(this.config.sessionListKey, {
        fields: {
          [FIELD_FACEBOOK_ID]: { type: Text },
          [FIELD_FACEBOOK_USERNAME]: { type: Text },
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

    this.passportStrategy = new PassportFacebook(
      {
        clientID: this.config.consumerKey,
        clientSecret: this.config.consumerSecret,
        callbackURL: this.config.callbackURL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          let result = await this.keystone.auth.User.facebook.validate({
            accessToken,
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
  async validate({ accessToken }) {
    const jsonData = await validateWithFacebook(this.passportStrategy, accessToken);

    // Lookup a past, verified session, that links to a user
    let pastSessionItem;
    let fieldItemPopulated;
    try {
      // NOTE: We don't need to filter on verifiedAt as these rows can only
      // possibly exist after we've validated with Facebook (see above)
      pastSessionItem = await this.getSessionList().adapter.findOne({
        [FIELD_FACEBOOK_ID]: jsonData.id,
      });
      // find user item related to past session, join not possible atm
      fieldItemPopulated =
        pastSessionItem &&
        (await this.getList().adapter.findById(pastSessionItem[FIELD_ITEM].toString()));
    } catch (sessionFindError) {
      // TODO: Better error message. Why would this fail? DB connection lost? A
      // "not found" shouldn't throw (it'll just return null).
      throw new Error(`Unable to lookup existing Facebook sessions: ${sessionFindError}`);
    }

    const newSessionData = {
      [FIELD_TOKEN_SECRET]: accessToken,
      [FIELD_FACEBOOK_ID]: jsonData.id,
      [FIELD_FACEBOOK_USERNAME]: null,
    };

    // Only add a reference to the parent list when we know the link exists
    if (pastSessionItem) {
      newSessionData[FIELD_ITEM] = fieldItemPopulated.id;
    }

    const sessionItem = await this.keystone.createItem(this.config.sessionListKey, newSessionData);

    const result = {
      success: true,
      list: this.getList(),
      facebookSession: sessionItem.id,
    };

    if (!pastSessionItem) {
      // If no previous facebookSession found...
      // Create a new Facebook session that doesn't like to an item yet
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

  pauseValidation(req, { facebookSession }) {
    if (!facebookSession) {
      throw new Error('Expected a facebookSession (ID) when pausing authentication validation');
    }
    // Store id in the req.session so it persists across requests (while they
    // potentially fill out a mutli-step form)
    req.session.keystoneFacebookSessionId = facebookSession;
  }

  async connectItem(req, { item }) {
    if (!item) {
      throw new Error('Must provide an `item` to connect to a facebook session');
    }

    if (!req) {
      throw new Error('Must provide `req` when connecting a Facebook Session to an item');
    }

    const facebookSessionId = req.session.keystoneFacebookSessionId;

    if (!facebookSessionId) {
      throw new Error(
        "Unable to extract Facebook Id from session. Maybe `pauseValidation()` wasn't called?"
      );
    }

    try {
      const facebookItem = await this.getSessionList().adapter.update(facebookSessionId, {
        item: item.id,
      });

      await this.getList().adapter.update(item.id, {
        [this.config.idField]: facebookItem[FIELD_FACEBOOK_ID],
        [this.config.usernameField]: facebookItem[FIELD_FACEBOOK_USERNAME],
      });
    } catch (error) {
      return { success: false, error };
    }
    return { success: true, item, list: this.getList() };
  }

  /**
   * Express Middleware to trigger the Facebook login flow (OAuth 1.0a)
   *
   * @param sessionExists {Function(itemId, req, res, next)}
   * Called when an existing session is detected (facebook or otherwise).
   * If not provided, will call `next()` directly, skipping Facebook login flow.
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
      // kick off the facebook auth process
      passport.authenticate('facebook', { session: false })(req, res, next);
    };
  }

  /**
   * Express Middleware to handle Facebook's response to the OAuth flow.
   *
   * @param failedVerification {Function(error<String>, req, res, next)}
   * Called when we can't verifiy the user details with Facebook. Shouldn't happen
   * in normal operation, however can be an attack vector upon the authentication
   * process. Default: calls `next()`, skipping the rest of the auth flow.
   */
  authenticateMiddleware({ failedVerification, verified }) {
    if (!failedVerification) {
      throw new Error(
        'Must supply a `failedVerification` function to `authenticateFacebookUser()`'
      );
    }
    if (!verified) {
      throw new Error('Must supply a `verified` function to `authenticateFacebookUser()`');
    }

    return (req, res, next) => {
      // This middleware will call the `verify` callback we passed up the top to
      // the `new PassportFacebook` constructor
      passport.authenticate('facebook', async (verifyError, authedItem, info) => {
        // If we get a error, bail and display the message we get
        if (verifyError) {
          return failedVerification(verifyError.message || verifyError.toString(), req, res, next);
        }
        // If we don't authorise Facebook we won't have any info about the
        // user so we need to bail
        if (!info) {
          return failedVerification(null, req, res, next);
        }
        // Otherwise, store the Facebook data in session so we can refer
        // back to it
        try {
          await this.keystone.auth.User.facebook.pauseValidation(req, info);

          await verified(authedItem, info, req, res, next);
        } catch (validationVerificationError) {
          next(validationVerificationError);
        }
      })(req, res, next);
    };
  }
}

FacebookAuthStrategy.authType = 'facebook';

module.exports = FacebookAuthStrategy;
