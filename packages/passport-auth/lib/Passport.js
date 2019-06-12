const passport = require('passport');
const { request } = require('graphql-request');

const FIELD_SERVICE_NAME = 'service';
const FIELD_USER_ID = 'serviceUserId';
const FIELD_USERNAME = 'serviceUsername';
const FIELD_TOKEN_SECRET = 'tokenSecret';
const FIELD_ITEM = 'item';

let isInitialized = false;

class PassportAuthStrategy {
  constructor(authType, keystone, listKey, config, ServiceStrategy = null) {
    this.authType = authType;
    this.keystone = keystone;
    this.listKey = listKey;
    this.config = {
      tokenSecretField: FIELD_TOKEN_SECRET,
      itemField: FIELD_ITEM,
      sessionListKey: `passportSession`,
      useSession: false,
      sessionIdField: 'passport',
      keystoneSessionIdField: 'keystone_passport',
      scope: [],
      ...config,
    };
    // The field name on the User list (for example) such as `facebookUserId` or
    // `twitterUserId` which the application developer has set.
    this.serviceIdField = this.config.idField;
    this.serviceUsernameField = this.config.usernameField;
    this.ServiceStrategy = ServiceStrategy;

    this.createSessionList();

    this.passportStrategy = this.getPassportStrategy(this.config.strategyConfig);
    passport.use(this.passportStrategy);
  }

  createSessionList() {
    if (!this.getSessionList()) {
      const { Text, Relationship } = require('@keystone-alpha/fields');

      // TODO: Set read permissions to be 'internal' (within keystone) only so
      // it doesn't expose a graphQL endpoint, or can be read or modified by
      // another user
      // NOTE: This doesn't use the `req.session` mechanism as it stores a
      // token secret which should not exist in the session store for security
      // reasons
      this.keystone.createList(this.config.sessionListKey, {
        fields: {
          [FIELD_SERVICE_NAME]: { type: Text },
          [FIELD_USER_ID]: { type: Text, mongooseOptions: { index: true } },
          [FIELD_USERNAME]: { type: Text },
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
          username: profile.displayName || null,
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

    const newSessionData = {
      [this.config.tokenSecretField]: accessToken,
      [FIELD_SERVICE_NAME]: this.authType,
      [FIELD_USER_ID]: validatedInfo.id,
      [FIELD_USERNAME]: validatedInfo.username,
    };

    let itemId;
    // Find an existing user that matches the given validated service id
    try {
      const queryName = this.getList().gqlNames.listQueryName;
      const data = await request(
        this.config.endpoint,
        `
        query($serviceId: String) {
          ${queryName}(
            first: 1
            where: {
              # eg; facebookUserId / googleUserId
              ${this.serviceIdField}: $serviceId
            }
          ) {
            id
          }
        }
      `,
        { serviceId: validatedInfo.id }
      );

      itemId = data[queryName].length ? data[queryName][0].id : null;

      // Only add a reference to the parent list when we know the link exists
      // we use connect here to link to an existent user in our mutation (UserRelateToOneInput)
      if (itemId) {
        newSessionData[this.config.itemField] = { connect: { id: itemId } };
      }
    } catch (sessionFindError) {
      throw new Error(`Unable to lookup existing ${this.authType} sessions: ${sessionFindError}`);
    }

    // Insert a new session row with the service ID, and maybe the associated
    // Keystone item id
    const mutationName = this.getSessionList().gqlNames.createMutationName;
    const mutationInputName = this.getSessionList().gqlNames.createInputName;

    const data = await request(
      this.config.endpoint,
      `
        mutation($newSessionDataObject: ${mutationInputName}) {
          ${mutationName}(data: $newSessionDataObject) {
            id
          }
        }
      `,
      {
        newSessionDataObject: newSessionData,
      }
    );
    const sessionItem = data[mutationName];

    const result = {
      success: true,
      list: this.getList(),
      profile: validatedInfo,
      [this.config.sessionIdField]: sessionItem.id,
    };

    if (!itemId) {
      // If no previous Session found...
      // Create a new Session session that doesn't like to an item yet
      return {
        ...result,
        newUser: true,
        item: {},
      };
    }

    return {
      ...result,
      item: { id: itemId },
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

  async connectItem(req, item) {
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
      const passportSessionMutationName = this.getSessionList().gqlNames.updateMutationName;
      const passportSessionMutationInputName = this.getSessionList().gqlNames.updateInputName;
      const serviceItem = await request(
        this.config.endpoint,
        `
          mutation($id: ID!, $data: ${passportSessionMutationInputName}) {
            ${passportSessionMutationName}(id: $id , data: $data) {
              id
              ${FIELD_USER_ID}
              serviceUsername
            }
          }
        `,
        {
          id: serviceSessionId,
          data: { item: { connect: { id: item.item.id } } },
        }
      );

      const userMutationName = this.getList().gqlNames.updateMutationName;
      const userMutationInputName = this.getList().gqlNames.updateInputName;
      const newServiceItemFields = {
        [this.serviceIdField]: serviceItem[passportSessionMutationName][FIELD_USER_ID],
        [this.serviceUsernameField]: serviceItem[passportSessionMutationName][FIELD_USERNAME],
      };

      await request(
        this.config.endpoint,
        `
          mutation($id: ID!, $newServiceItemFields: ${userMutationInputName}) {
            ${userMutationName}(id: $id ,data: $newServiceItemFields) {
              id
            }
          }
        `,
        {
          id: item.item.id,
          newServiceItemFields,
        }
      );
    } catch (error) {
      return { success: false, error };
    }
    return { success: true, list: this.getList() };
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
      passport.authenticate(this.authType, async (verifyError, item, info) => {
        // If we get a error, bail and display the message we get
        if (verifyError) {
          return failedVerification(verifyError.message || verifyError.toString(), req, res, next);
        }
        // If we don't authenticate at Service we won't have any info about the
        // user so we need to bail
        if (!info[this.config.sessionIdField]) {
          return failedVerification('Unable to authenticate user', req, res, next);
        }
        // Otherwise, store the Service data in session so we can refer
        // back to it
        try {
          this.pauseValidation(req, info);

          await verified(item, info, req, res, next);
        } catch (validationVerificationError) {
          next(validationVerificationError);
        }
      })(req, res, next);
    };
  }

  //#region abstract method, must implement if ServiceStrategy is not provided in constructor
  getPassportStrategy(strategyConfig) {
    if (!this.ServiceStrategy) {
      throw new Error(
        `Must provide PassportJs strategy Type in constructor or override this method in ${
          this.authType
        }`
      );
    }

    return new this.ServiceStrategy(
      {
        clientID: this.config.consumerKey,
        clientSecret: this.config.consumerSecret,
        callbackURL: this.config.callbackURL,
        passReqToCallback: true,
        ...strategyConfig,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          let result = await this.validate({
            accessToken,
          });
          if (!result.success) {
            // false indicates an authentication failure
            // `done` is the callback passed to `passport.authenticate`, so
            // params passed here will be the arguments to that function
            return done(null, false, { ...result, profile });
          }
          // `done` is the callback passed to `passport.authenticate`, so params
          // passed here will be the arguments to that function
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

PassportAuthStrategy.InitializePassportAuthStrategies = app => {
  if (!isInitialized) {
    app.use(passport.initialize());
  }
  isInitialized = true;
};

module.exports = PassportAuthStrategy;
