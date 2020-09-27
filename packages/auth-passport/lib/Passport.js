const express = require('express');
const passport = require('passport');
const assert = require('nanoassert');

const FIELD_SERVICE_NAME = 'service';
const FIELD_USER_ID = 'serviceUserId';
const FIELD_TOKEN_SECRET = 'tokenSecret';
const FIELD_REFRESH_TOKEN = 'refreshToken';
const FIELD_ITEM = 'item';
const PASSPORT_SESSION_LIST_KEY = 'passportSession';
const PASSPORT_SESSION_COOKIE_KEY = 'passportSessionId';

let isInitialized = false;

const sessionFragment = `
  id
  ${FIELD_USER_ID}
  ${FIELD_TOKEN_SECRET}
  ${FIELD_REFRESH_TOKEN}
`;

/**
 * Nomenclature:
 * - Service: An Authentication Service provider. Eg; Google, Facebook, etc
 * - Client: See "Service"
 * - Passport: The Passport.js library
 * - Session: Data stored in the user's session (via a cookie)
 * - List: A Keystone 5 list (eg; User)
 * - Item: An item from a Keystone 5 list
 */
class PassportAuthStrategy {
  constructor(authType, keystone, listKey, config, ServiceStrategy = null, schemaName = 'public') {
    assert(!!config.callbackPath, 'Must provide `config.callbackPath` option.');
    assert(!!config.appId, 'Must provide `config.appId` option.');
    assert(!!config.appSecret, 'Must provide `config.appSecret` option.');
    assert(!!config.loginPath, 'Must provide `config.loginPath` option.');
    assert(!!config.idField, 'Must provide `config.idField` option.');
    assert(
      typeof config.cookieSecret === 'undefined',
      'The `cookieSecret` config option for `PassportAuthStrategy` has been moved to the `Keystone` constructor: `new Keystone({ cookieSecret: "abc" })`.'
    );
    assert(
      ['function', 'undefined'].includes(typeof config.resolveCreateData),
      'When `config.resolveCreateData` is passed, it must be a function.'
    );
    assert(
      ['function', 'undefined'].includes(typeof config.onAuthenticated),
      'When `config.onAuthenticated` is passed, it must be a function.'
    );
    assert(
      ['function', 'undefined'].includes(typeof config.onError),
      'When `config.onError` is passed, it must be a function.'
    );
    assert(
      ['function', 'undefined'].includes(typeof config.loginPathMiddleware),
      'When `config.loginPathMiddleware` is passed, it must be an express middleware function.'
    );
    assert(
      ['function', 'undefined'].includes(typeof config.callbackPathMiddleware),
      'When `config.callbackPathMiddleware` is passed, it must be an express middleware function.'
    );

    // NOTE: Remove after March 1st, 2020 (ie; 6mo since deprecation)
    if (typeof config.hostURL !== 'undefined') {
      console.warn(
        'The `hostURL` config option for `PassportAuthStrategy` has been removed and is no longer necessary.'
      );
    }

    // NOTE: Remove after March 1st, 2020 (ie; 6mo since deprecation)
    if (typeof config.apiPath !== 'undefined') {
      console.warn(
        'The `apiPath` config option for `PassportAuthStrategy` has been removed and is no longer necessary.'
      );
    }

    this.authType = authType;

    // Capture some useful variables
    this._keystone = keystone;
    this._listKey = listKey;
    this._ServiceStrategy = ServiceStrategy;
    this._sessionManager = keystone._sessionManager;
    this._schemaName = schemaName;

    // Pull all the required data off the `config` object
    this._serviceAppId = config.appId;
    this._serviceAppSecret = config.appSecret;
    this._loginPath = config.loginPath;
    this._loginPathMiddleware = config.loginPathMiddleware || ((req, res, next) => next());
    this._callbackPath = config.callbackPath;
    this._callbackHost = config.callbackHost || '';
    this._callbackPathMiddleware = config.callbackPathMiddleware || ((req, res, next) => next());
    this._passportScope = config.scope || [];
    this._authOptions = config.authOptions || {};
    this._resolveCreateData = config.resolveCreateData || (({ createData }) => createData);
    this._onAuthenticated = config.onAuthenticated || (() => {});
    this._onError =
      config.onError ||
      (error => {
        throw error;
      });

    // The field name on the User list (for example) such as `facebookUserId` or
    // `twitterUserId` which the application developer has set.
    this._serviceIdField = config.idField;

    this._createSessionList();

    // Enable _getPassportStrategy() to be overwritten as some are unique (eg;
    // Twitter)
    this._passportStrategy = this._getPassportStrategy(config.strategyConfig);

    // Tell passport.js about the strategy we setup
    passport.use(this._passportStrategy);
  }

  getInputFragment() {
    return `
      itemId: ID!
      accessToken: String!
    `;
  }

  async _executeQuery({ query, variables }) {
    const { errors, data } = await this._keystone.executeGraphQL({
      context: this._keystone.createContext({
        schemaName: this._schemaName,
        skipAccessControl: true,
      }),
      query,
      variables,
    });
    if (errors) {
      throw errors;
    }
    return data;
  }

  // Called this from within Keystone's .prepare() method
  prepareMiddleware() {
    const app = express();

    if (!isInitialized) {
      app.use(passport.initialize());
    }
    isInitialized = true;

    app.get(this._loginPath, this._loginPathMiddleware, (req, res, next) => {
      // If the user isn't already logged in
      // kick off the service auth process
      passport.authenticate(this.authType, {
        session: false,
        scope: this._passportScope,
        ...this._authOptions,
      })(req, res, next);
    });

    app.get(this._callbackPath, this._callbackPathMiddleware, (req, res, next) => {
      // This middleware will call the `verify` callback we passed up the top to
      // the `new Passport{Service}` constructor
      passport.authenticate(
        this.authType,
        async (verifyError, { serviceProfile, accessToken, passportSessionInfo } = {}) => {
          // If we get an error, bail and display the message we get
          if (verifyError) {
            return this._onError(verifyError, req, res, next);
          }

          // If we don't authenticate at Service we won't have any info about the
          // user so we need to bail
          if (!serviceProfile.id) {
            return this._onError(new Error('Unable to authenticate user'), req, res, next);
          }

          // Find an existing user that matches the given validated service id
          let item;
          try {
            const queryName = this._getList().gqlNames.listQueryName;
            const data = await this._executeQuery({
              query: `
                query($serviceId: String) {
                  ${queryName}(
                    first: 1
                    where: {
                      # eg; facebookUserId / googleUserId
                      ${this._serviceIdField}: $serviceId
                    }
                  ) {
                    id
                  }
                }
              `,
              variables: { serviceId: serviceProfile.id },
            });

            item = data[queryName].length ? data[queryName][0] : null;
          } catch (error) {
            return this._onError(
              new Error('Unable to authenticate user with given Token'),
              req,
              res,
              next
            );
          }

          // Existing item found associated with the service based on the
          // accessToken
          if (item) {
            await this.finalizeAuthentication({
              itemData: { id: item.id },
              operation: 'connect',
              passportSessionInfo,
              accessToken,
              req,
              res,
              next,
            });
            return;
          }

          // No existing item found, so we trigger the creation flow
          let isPaused = false;
          const resolvedCreateData = await this._resolveCreateData(
            {
              // First time through, this dataset is empty
              createData: {},
              serviceProfile,
              actions: {
                pauseAuthentication: () => {
                  isPaused = true;

                  // Store id in the req.session so it persists across requests
                  // (while they potentially fill out a mutli-step form)
                  req.session[PASSPORT_SESSION_COOKIE_KEY] = passportSessionInfo.id;
                },
              },
            },
            req,
            res,
            next
          );

          // The app has asked us to pause our authentication flow, we bail
          // early here and let the app handle the rest
          if (isPaused) {
            return;
          }

          // We're not paused, and we have some user data. Let's continue!
          const createData = {
            ...resolvedCreateData,
            [this._serviceIdField]: serviceProfile.id,
          };

          await this.finalizeAuthentication({
            itemData: createData,
            operation: 'create',
            passportSessionInfo,
            accessToken,
            req,
            res,
            next,
          });
        }
      )(req, res, next);
    });

    return app;
  }

  async resumeAuthentication(createData, req, res, next) {
    if (!this._authenticationPaused(req)) {
      throw new Error(
        `Unable to extract ${this.authType} Id from session. Maybe \`pauseAuthentication()\` wasn't called?`
      );
    }

    // Get the id of the item in the KS5 Passport Session List
    const passportSessionId = req.session[PASSPORT_SESSION_COOKIE_KEY];

    // Extract the accessToken from the Passport Session List Item
    const queryName = this._getSessionList().gqlNames.itemQueryName;
    const { getSession: passportSessionInfo } = await this._executeQuery({
      query: `
        query($id: ID!) {
          getSession: ${queryName}(where: { id: $id }) {
            ${sessionFragment}
          }
        }
      `,
      variables: { id: passportSessionId },
    });

    // Ask the service for all the profile info for the given accessToken
    const serviceProfile = await this._validateWithService(
      this._passportStrategy,
      passportSessionInfo[FIELD_TOKEN_SECRET],
      passportSessionInfo[FIELD_REFRESH_TOKEN]
    );

    // Let the app resolve the creation data again
    const resolvedCreateData = await this._resolveCreateData(
      {
        // This time through, there is a dataset to pass
        createData,
        serviceProfile,
        actions: {
          // The app shouldn't attempt to pause a second time.
          pauseAuthentication: () => {
            throw new Error(
              'Attempted to pause authentication a second time after resuming. This is probably a mistake.'
            );
          },
        },
      },
      req,
      res,
      next
    );

    // Trigger the creation flow again now that we have all the info rehydrated
    await this.finalizeAuthentication({
      itemData: resolvedCreateData,
      operation: 'create',
      passportSessionInfo,
      accessToken: passportSessionInfo[FIELD_TOKEN_SECRET],
      req,
      res,
      next,
    });
  }

  async getProfileData() {}

  _authenticationPaused(req) {
    return !!req.session[PASSPORT_SESSION_COOKIE_KEY];
  }

  _createSessionList() {
    if (!this._getSessionList()) {
      const { Text, Relationship } = require('@keystonejs/fields');

      // TODO: Set read permissions to be 'internal' (within keystone) only so
      // it doesn't expose a graphQL endpoint, or can be read or modified by
      // another user
      // NOTE: This doesn't use the `req.session` mechanism as it stores a
      // token secret which should not exist in the session store for security
      // reasons
      this._keystone.createList(PASSPORT_SESSION_LIST_KEY, {
        fields: {
          [FIELD_SERVICE_NAME]: { type: Text },
          [FIELD_USER_ID]: { type: Text },
          [FIELD_TOKEN_SECRET]: { type: Text },
          [FIELD_REFRESH_TOKEN]: { type: Text },
          [FIELD_ITEM]: {
            type: Relationship,
            ref: this._listKey,
          },
          /* TODO
          verifiedAt: { type: Datetime },
          valid: { type: Bool, default: false },
          */
        },
        access: {
          read: () => false,
          update: () => false,
          create: () => false,
          delete: () => false,
          auth: true,
        },
      });
    }
  }

  _getList() {
    return this._keystone.lists[this._listKey];
  }

  _getSessionList() {
    return this._keystone.lists[PASSPORT_SESSION_LIST_KEY];
  }

  async _validateWithService(strategy, accessToken) {
    return new Promise((resolve, reject) => {
      strategy.userProfile(accessToken, async (error, serviceProfile) => {
        if (error) {
          return reject(error);
        }
        resolve(serviceProfile);
      });
    });
  }

  //#region abstract method, must implement if ServiceStrategy is not provided in constructor
  _getPassportStrategy(strategyConfig) {
    if (!this._ServiceStrategy) {
      throw new Error(
        `Must provide PassportJs strategy Type in constructor or override this method in ${this.authType}`
      );
    }

    return new this._ServiceStrategy(
      {
        clientID: this._serviceAppId,
        clientSecret: this._serviceAppSecret,
        callbackURL: `${this._callbackHost}${this._callbackPath}`,
        passReqToCallback: true,
        ...strategyConfig,
      },
      async (req, accessToken, refreshToken, basicServiceProfile, done) => {
        const serviceProfile = await this._validateWithService(
          this._passportStrategy,
          accessToken,
          refreshToken,
          basicServiceProfile
        );
        // Insert a new session row with the service ID, and maybe the associated
        // Keystone item id
        const mutationName = this._getSessionList().gqlNames.createMutationName;
        const mutationInputName = this._getSessionList().gqlNames.createInputName;

        const { createSession: passportSessionInfo } = await this._executeQuery({
          query: `
            mutation($newSessionDataObject: ${mutationInputName}) {
              createSession: ${mutationName}(data: $newSessionDataObject) {
                ${sessionFragment}
              }
            }
          `,
          variables: {
            newSessionDataObject: {
              [FIELD_TOKEN_SECRET]: accessToken,
              [FIELD_REFRESH_TOKEN]: refreshToken,
              [FIELD_SERVICE_NAME]: this.authType,
              [FIELD_USER_ID]: serviceProfile.id,
            },
          },
        });

        done(null, { serviceProfile, accessToken, passportSessionInfo });
      }
    );
  }
  //#endregion

  async finalizeAuthentication({
    itemData,
    operation,
    passportSessionInfo,
    accessToken,
    req,
    res,
    next,
  }) {
    try {
      const item = await this._createOrUpdateItem({
        itemData,
        operation,
        passportSessionInfo,
      });
      await this._authenticateItem(item, accessToken, operation === 'create', req, res, next);
    } catch (error) {
      this._onError(error, req, res, next);
    }
  }

  async _createOrUpdateItem({ itemData, operation, passportSessionInfo }) {
    // Inject the service user ID into the newly created user's account info
    assert(
      passportSessionInfo[FIELD_USER_ID],
      `Cannot determine ${this._serviceIdField} for ${this._listKey}`
    );
    assert(['create', 'connect'].includes(operation), '`operation` must be "create" or "connect"');

    if (operation === 'create') {
      // When creating the user, make sure we save the service user id along
      // with it
      itemData[this._serviceIdField] = passportSessionInfo[FIELD_USER_ID];
    }

    const passportSessionMutationName = this._getSessionList().gqlNames.updateMutationName;
    const passportSessionMutationInputName = this._getSessionList().gqlNames.updateInputName;

    // Here we create both the Passport Session Item and the User Item
    // in KS5 as a single, nested mutation.
    const data = await this._executeQuery({
      query: `
        mutation($id: ID!, $data: ${passportSessionMutationInputName}) {
          session: ${passportSessionMutationName}(id: $id , data: $data) {
            item {
              id
            }
          }
        }
      `,
      // Create the Keystone item as a Nested Mutation
      variables: { id: passportSessionInfo.id, data: { item: { [operation]: itemData } } },
    });

    return data.session.item;
  }

  async _authenticateItem(item, accessToken, isNewItem, req, res, next) {
    const token = await this._sessionManager.startAuthedSession(req, {
      item,
      list: this._getList(),
    });
    this._onAuthenticated({ token, item, isNewItem }, req, res, next);
  }
}

PassportAuthStrategy.authType = 'base-abstract';

module.exports = PassportAuthStrategy;
