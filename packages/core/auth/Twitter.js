const { OAuth } = require('oauth-libre');
const { Text, Relationship } = require('@keystonejs/fields');

const FIELD_TWITTER_ID = 'twitterId';
const FIELD_TWITTER_USERNAME = 'twitterUsername';
const FIELD_TOKEN_SECRET = 'tokenSecret';
const FIELD_ITEM = 'item';

function validateWithTwitter(client, token, tokenSecret) {
  return new Promise((resolve, reject) => {
    client.get(
      'https://api.twitter.com/1.1/account/verify_credentials.json',
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
          // https://developer.twitter.com/en/docs/basics/response-codes
          if (statusCode >= 400 && statusCode < 500) {
            message = 'An error occured while contacting Twitter.';
          } else if (statusCode >= 500) {
            message = 'Twitter is temporarily having issues.';
          }

          // reduce the error messages into a coherent string
          const errorsString = reduceTwitterErrorsToString(jsonData);

          if (errorsString) {
            message = `${message} ${errorsString}`;
          }

          return reject(new Error(message));
        }

        if (data) {
          try {
            jsonData = JSON.parse(data);
          } catch {
            return reject(
              'Unable to parse server response from Twitter. Expected JSON, got:',
              require('utils').inspect(data),
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
function reduceTwitterErrorsToString(jsonData) {
  if (!jsonData.errors) {
    return '';
  }

  const errors = Array.isArray(jsonData.errors) ? jsonData.errors : [jsonData.errors];

  // reduce the error messages into a coherent string
  return errors
    .map((errorBody) => {
      if (errorBody.message && errorBody.code) {
        return `(${errorBody.code}) ${errorBody.message}.`;
      } else if (Object.prototype.toString.call(errorBody) === '[object Object]') {
        return JSON.stringify(errorBody);
      }
      return errorBody.toString();
    })
    .join(' ')
    .trim();
}

class TwitterAuthStrategy {
  constructor(keystone, listKey, config) {
    this.keystone = keystone;
    this.listKey = listKey;
    this.config = {
      idField: 'twitterId',
      usernameField: 'twitterUsername',
      sessionListKey: 'TwitterSessions',
      ...config,
    };

    this.twitterClient = new OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      this.config.key,
      this.config.secret,
      '1.0A',
      null,
      'HMAC-SHA1'
    );

    this.twitterClient.setDefaultContentType('application/json');

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
  }
  getList() {
    return this.keystone.lists[this.listKey];
  }
  getSessionList() {
    return this.keystone.lists[this.config.sessionListKey];
  }
  async validate({ token, tokenSecret }) {
    const jsonData = await validateWithTwitter(this.twitterClient, token, tokenSecret);

    // Lookup a past, verified session, that links to a user
    let pastSessionItem;
    try {
      // NOTE: We don't need to filter on verifiedAt as these rows can only
      // possibly exist after we've validated with Twitter (see above)
      pastSessionItem = await this.getSessionList().model
        .findOne({
          [FIELD_TWITTER_ID]: jsonData.id_str,
        })
        // do a JOIN on the item
        .populate(FIELD_ITEM)
        .exec();
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
      newSessionData.item = pastSessionItem.item.id;
    }

    const sessionItem = await this.keystone.createItem(this.config.sessionListKey, newSessionData);

    if (!pastSessionItem) {
      // If no previous twitterSession found...
      // Create a new Twitter session that doesn't like to an item yet
      return { success: true, newUser: true, twitterSession: sessionItem.id, list: this.getList() };
    }

    const previouslyVerifiedItem = pastSessionItem[FIELD_ITEM];
    return { success: true, list: this.getList(), item: previouslyVerifiedItem };
  }

  async pauseValidation(req, { /* item, */ twitterSession }) {
    if (!twitterSession) {
      throw new Error('Expected a twitterSession (ID) when pausing authentication validation');
    }
    // TODO:
    // 1. Store twitterSession.id in the req.session so it persists across
    //    requests (while they potentially fill out a mutli-step form)

    throw new Error('Twitter::pauseValidation not yet implemented');
  }

  async connectItem({ req, twitterSession, item }) {
    if (!item) {
      throw new Error('Must provide an `item` to connect to a twitter session');
    }

    if (!twitterSession && !req) {
      throw new Error('Must provide either `req` or `twitterSession` when connecting a Twitter Session to an item');
    }

    try {
      if (twitterSession) {
        const twitterItem = await this.getSessionList().model.findByIdAndUpdate(
          twitterSession,
          { item: item.id },
          { new: true },
        ).exec();

        await this.getList().model.findByIdAndUpdate(item.id, {
          [this.config.idField]: twitterItem[FIELD_TWITTER_ID],
          [this.config.usernameField]: twitterItem[FIELD_TWITTER_USERNAME],
        }).exec();
      } else if (req) {
        // TODO:
        // 0. Check `newItem.type === this.getList().type`
        // 1. Extract the twitterSession.id from req.session
        // 2. Associate the twitterSession item with the newItem it's authing
        // 3. Return { item: newItem }
        throw new Error('Twitter::connectItem({ req }) not yet implemented');
      }
    } catch(error) {
      return { success: false };
    }
    return { success: true, item, list: this.getList() };
  }
}

TwitterAuthStrategy.authType = 'twitter';

module.exports = TwitterAuthStrategy;
