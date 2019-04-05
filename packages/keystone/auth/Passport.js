const passport = require('passport');
const { Text, Relationship } = require('@keystone-alpha/fields');

const FIELD_TOKEN_SECRET = 'tokenSecret';
const FIELD_ITEM = 'item';

let isInitialized = false;

class PassportAuthStrategy {
  constructor(authType, keystone, listKey, config, ServiceStrategy = null) {
    this.authType = authType;
    this.keystone = keystone;
    this.listKey = listKey;
    this.config = {
      idField: `${authType}Id`,
      usernameField: `${authType}Username`,
      tokenSecretField: FIELD_TOKEN_SECRET,
      itemField: FIELD_ITEM,
      sessionListKey: `${authType}Session`,
      useSession: false,
      sessionIdField: 'passport',
      keystoneSessionIdField: 'keystone_passport',
      scope: [],
      ...config,
    };
    this.ServiceStrategy = ServiceStrategy;

    this.createSessionList();

    PassportAuthStrategy.initializePassport(this.config.server);

    this.passportStrategy = this.getPassportStrategy();
    passport.use(this.passportStrategy);
  }

  static initializePassport(server) {
    if (!isInitialized) {
      server.app.use(passport.initialize());
    }
    isInitialized = true;
  }

  createSessionList() {
    if (!this.getSessionList()) {
      // TODO: Set read permissions to be 'internal' (within keystone) only so
      // it doesn't expose a graphQL endpoint, or can be read or modified by
      // another user
      // NOTE: This doesn't use the `req.session` mechanism as it stores a
      // token secret which should not exist in the session store for security
      // reasons
      this.keystone.createList(this.config.sessionListKey, {
        fields: {
          [this.config.idField]: { type: Text },
          [this.config.usernameField]: { type: Text },
          [this.config.tokenSecretField]: { type: Text },
          [this.config.itemField]: {
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
  }

  getList() {
    return this.keystone.lists[this.listKey];
  }

  getSessionList() {
    return this.keystone.lists[this.config.sessionListKey];
  }

  async validateWithService(strategy, accessToken) {
    return new Promise((resolve, reject) => {
      strategy.userProfile(accessToken, async (error, profile) => {
        if (error) {
          return reject(error);
        }
        resolve({
          id: profile.id,
          username: profile.username || null,
        });
      });
    });
  }

  async validate({ accessToken, ...validationArgs }) {
    const validatedInfo = await this.validateWithService(
      this.passportStrategy,
      accessToken,
      validationArgs
    );

    // Lookup a past, verified session, that links to a user
    let pastSessionItem;
    let fieldItemPopulated;
    try {
      // NOTE: We don't need to filter on verifiedAt as these rows can only
      // possibly exist after we've validated with Passport Service (see above)
      pastSessionItem = await this.getSessionList().adapter.findOne({
        [this.config.idField]: validatedInfo.id,
      });
      // find user item related to past session, join not possible atm
      fieldItemPopulated =
        pastSessionItem &&
        (await this.getList().adapter.findById(pastSessionItem[this.config.itemField].toString()));
    } catch (sessionFindError) {
      // TODO: Better error message. Why would this fail? DB connection lost? A
      // "not found" shouldn't throw (it'll just return null).
      throw new Error(`Unable to lookup existing ${this.authType} sessions: ${sessionFindError}`);
    }

    const newSessionData = {
      [this.config.tokenSecretField]: accessToken,
      [this.config.idField]: validatedInfo.id,
      [this.config.usernameField]: validatedInfo.username,
    };

    // Only add a reference to the parent list when we know the link exists
    if (pastSessionItem) {
      newSessionData[this.config.itemField] = fieldItemPopulated.id;
    }

    const sessionItem = await this.keystone.createItem(this.config.sessionListKey, newSessionData);

    const result = {
      success: true,
      list: this.getList(),
      [this.config.sessionIdField]: sessionItem.id,
    };

    if (!pastSessionItem) {
      // If no previous Session found...
      // Create a new Session session that doesn't like to an item yet
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

  pauseValidation(req, { [this.config.sessionIdField]: sessionId }) {
    if (!sessionId) {
      throw new Error('Expected a githubSession (ID) when pausing authentication validation');
    }
    // Store id in the req.session so it persists across requests (while they
    // potentially fill out a mutli-step form)
    req.session[this.config.keystoneSessionIdField] = sessionId;
  }

  async connectItem(req, { item }) {
    if (!item) {
      throw new Error(`Must provide an \`item\` to connect to a ${this.authType} session`);
    }

    if (!req) {
      throw new Error(`Must provide \`req\` when connecting a ${this.authType} Session to an item`);
    }

    const serviceSessionId = req.session[this.config.keystoneSessionIdField];

    if (!serviceSessionId) {
      throw new Error(
        `Unable to extract ${
          this.authType
        } Id from session. Maybe \`pauseValidation()\` wasn't called?`
      );
    }

    try {
      const serviceItem = await this.getSessionList().adapter.update(serviceSessionId, {
        item: item.id,
      });

      await this.getList().adapter.update(item.id, {
        [this.config.idField]: serviceItem[this.config.idField],
        [this.config.usernameField]: serviceItem[this.config.usernameField],
      });
    } catch (error) {
      return { success: false, error };
    }
    return { success: true, item, list: this.getList() };
  }

  /**
   * Express Middleware to trigger the Service login flow (OAuth 2.0)
   *
   * @param sessionExists {Function(itemId, req, res, next)}
   * Called when an existing session is detected (any passport session or otherwise).
   * If not provided, will call `next()` directly, skipping passport login flow.
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
      // kick off the service auth process
      passport.authenticate(this.authType, {
        session: this.config.useSession,
        scope: this.config.scope,
      })(req, res, next);
    };
  }

  /**
   * Express Middleware to handle Passport Service's response to the OAuth flow.
   *
   * @param failedVerification {Function(error<String>, req, res, next)}
   * Called when we can't verifiy the user details with Service. Shouldn't happen
   * in normal operation, however can be an attack vector upon the authentication
   * process. Default: calls `next()`, skipping the rest of the auth flow.
   */
  authenticateMiddleware({ failedVerification, verified }) {
    if (!failedVerification) {
      throw new Error("Must supply a `failedVerification` function to passport's `authenticate()`");
    }
    if (!verified) {
      throw new Error("Must supply a `verified` function to passport's `authenticate()`");
    }

    return (req, res, next) => {
      // This middleware will call the `verify` callback we passed up the top to
      // the `new Passport{Service}` constructor
      passport.authenticate(this.authType, async (verifyError, passportUser, info) => {
        // If we get a error, bail and display the message we get
        if (verifyError) {
          return failedVerification(verifyError.message || verifyError.toString(), req, res, next);
        }
        // If we don't authorise at Service we won't have any info about the
        // user so we need to bail
        if (!info) {
          return failedVerification(null, req, res, next);
        }
        // Otherwise, store the Service data in session so we can refer
        // back to it
        try {
          await this.keystone.auth.User[this.authType].pauseValidation(req, info);

          await verified(passportUser, info, req, res, next);
        } catch (validationVerificationError) {
          next(validationVerificationError);
        }
      })(req, res, next);
    };
  }

  //#region abstract method, must implement if ServiceStrategy is not provided in constructor
  getPassportStrategy() {
    if (!this.ServiceStrategy) {
      throw new Error(
        `Must provide PassportJs strategy Type in constructor or override this method in ${
          this.authType
        }`
      );
    }

    return new this.ServiceStrategy(
      {
        clientID: this.config.clientID,
        clientSecret: this.config.clientSecret,
        callbackURL: this.config.callbackURL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          let result = await this.keystone.auth.User[this.authType].validate({
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
  }
  //#endregion
}

PassportAuthStrategy.authType = 'base-abstract';

module.exports = PassportAuthStrategy;
