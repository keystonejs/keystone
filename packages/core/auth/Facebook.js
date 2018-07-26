const passport = require('passport');
const { OAuth } = require('oauth-libre');
const PassportFacebook = require('passport-facebook');
const { Text, Relationship } = require('@keystonejs/fields');

const FIELD_FACEBOOK_ID = 'facebookId';
const FIELD_FACEBOOK_USERNAME = 'facebookUsername';
const FIELD_TOKEN_SECRET = 'tokenSecret';
const FIELD_ITEM = 'item';

function validateWithFacebook(client, token, tokenSecret) {
  return new Promise((resolve, reject) => {
    client.get(
      'https://graph.facebook.com/v3.0/oauth/access_token',
      token,
      tokenSecret,
      async (error, data) => {
        let jsonData;

        if (error) {
          const { statusCode, data: errorData } = error;

          let message;

          try {
            jsonData = JSON.parse(errorData);
          } catch (jsonParseError) {
            jsonData = {};
          }

          // For more detailed error messages, see:
          // https://developer.facebook.com/en/docs/basics/response-codes
          if (statusCode >= 400 && statusCode < 500) {
            message = 'An error occured while contacting Facebook.';
          } else if (statusCode >= 500) {
            message = 'Facebook is temporarily having issues.';
          }

          // reduce the error messages into a coherent string
          const errorsString = reduceFacebookErrorsToString(jsonData);

          if (errorsString) {
            message = `${message} ${errorsString}`;
          }

          return reject(new Error(message));
        }

        if (data) {
          try {
            jsonData = JSON.parse(data);
          } catch (e) {
            return reject(
              'Unable to parse server response from Facebook. Expected JSON, got:',
              require('utils').inspect(data)
            );
          }
        } else {
          jsonData = {};
        }

        resolve(jsonData);
      }
    );
  });
}

// reduce the error messages into a coherent string
function reduceFacebookErrorsToString(jsonData) {
  if (!jsonData.errors) {
    return '';
  }

  const errors = Array.isArray(jsonData.errors)
    ? jsonData.errors
    : [jsonData.errors];

  // reduce the error messages into a coherent string
  return errors
    .map(errorBody => {
      if (errorBody.message && errorBody.code) {
        return `(${errorBody.code}) ${errorBody.message}.`;
      } else if (
        Object.prototype.toString.call(errorBody) === '[object Object]'
      ) {
        return JSON.stringify(errorBody);
      }
      return errorBody.toString();
    })
    .join(' ')
    .trim();
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

    this.facebookClient = new OAuth(
      'https://api.facebook.com/oauth/request_token',
      'https://api.facebook.com/oauth/access_token',
      this.config.consumerKey,
      this.config.consumerSecret,
      '1.0A',
      null,
      'HMAC-SHA1'
    );

    this.facebookClient.setDefaultContentType('application/json');

    if (!this.getSessionList()) {
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

    passport.use(
      new PassportFacebook(
        {
          clientID: this.config.consumerKey,
          clientSecret: this.config.consumerSecret,
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
            let result = await this.keystone.auth.User.facebook.validate({
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
      )
    );

    this.config.server.app.use(passport.initialize());
  }
  getList() {
    return this.keystone.lists[this.listKey];
  }
  getSessionList() {
    return this.keystone.lists[this.config.sessionListKey];
  }
  async validate({ token, tokenSecret }) {
    const jsonData = await validateWithFacebook(
      this.facebookClient,
      token,
      tokenSecret
    );

    // Lookup a past, verified session, that links to a user
    let pastSessionItem;
    try {
      // NOTE: We don't need to filter on verifiedAt as these rows can only
      // possibly exist after we've validated with Facebook (see above)
      pastSessionItem = await this.getSessionList()
        .adapter.findOne({
          [FIELD_FACEBOOK_ID]: jsonData.id_str,
        })
        // do a JOIN on the item
        .populate(FIELD_ITEM)
        .exec();
    } catch (sessionFindError) {
      // TODO: Better error message. Why would this fail? DB connection lost? A
      // "not found" shouldn't throw (it'll just return null).
      throw new Error(
        `Unable to lookup existing Facebook sessions: ${sessionFindError}`
      );
    }

    const newSessionData = {
      [FIELD_TOKEN_SECRET]: tokenSecret,
      [FIELD_FACEBOOK_ID]: jsonData.id_str,
      [FIELD_FACEBOOK_USERNAME]: jsonData.screen_name,
    };

    // Only add a reference to the parent list when we know the link exists
    if (pastSessionItem && pastSessionItem.item) {
      newSessionData.item = pastSessionItem.item.id;
    }

    const sessionItem = await this.keystone.createItem(
      this.config.sessionListKey,
      newSessionData
    );

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

    const previouslyVerifiedItem = pastSessionItem[FIELD_ITEM];
    return {
      ...result,
      item: previouslyVerifiedItem,
    };
  }

  pauseValidation(req, { facebookSession }) {
    if (!facebookSession) {
      throw new Error(
        'Expected a facebookSession (ID) when pausing authentication validation'
      );
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
      throw new Error(
        'Must provide `req` when connecting a Facebook Session to an item'
      );
    }

    const facebookSessionId = req.session.keystoneFacebookSessionId;

    if (!facebookSessionId) {
      throw new Error(
        "Unable to extract Facebook Id from session. Maybe `pauseValidation()` wasn't called?"
      );
    }

    try {
      const facebookItem = await this.getSessionList()
        .adapter.update(facebookSessionId, { item: item.id }, { new: true })
        .exec();

      await this.getList()
        .adapter.update(item.id, {
          [this.config.idField]: facebookItem[FIELD_FACEBOOK_ID],
          [this.config.usernameField]: facebookItem[FIELD_FACEBOOK_USERNAME],
        })
        .exec();
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
      throw new Error(
        'Must supply a `verified` function to `authenticateFacebookUser()`'
      );
    }

    return (req, res, next) => {
      // This middleware will call the `verify` callback we passed up the top to
      // the `new PassportFacebook` constructor
      passport.authenticate(
        'facebook',
        async (verifyError, authedItem, info) => {
          // If we get a error, bail and display the message we get
          if (verifyError) {
            return failedVerification(
              verifyError.message || verifyError.toString(),
              req,
              res,
              next
            );
          }
          // If we don't authorise Facebook we won't have any info about the
          // user so we need to bail
          if (!info) {
            return failedVerification(
              null,
              req,
              res,
              next
            );
          }
          // Otherwise, store the Facebook data in session so we can refer
          // back to it
          try {
            await this.keystone.auth.User.facebook.pauseValidation(req, info);

            await verified(authedItem, info, req, res, next);
          } catch (validationVerificationError) {
            next(validationVerificationError);
          }
        }
      )(req, res, next);
    };
  }
}

FacebookAuthStrategy.authType = 'facebook';

module.exports = FacebookAuthStrategy;
