require('dotenv').config();
const { v4: uuid } = require('uuid');
const { sendEmail } = require('./emails');

const {
  CloudinaryImage,
  Checkbox,
  DateTime,
  Integer,
  Password,
  Relationship,
  Select,
  Text,
} = require('@keystonejs/fields');
const { CloudinaryAdapter } = require('@keystonejs/file-adapters');
const { Wysiwyg } = require('@keystonejs/fields-wysiwyg-tinymce');

const cloudinaryAdapter = new CloudinaryAdapter({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_KEY,
  apiSecret: process.env.CLOUDINARY_SECRET,
});

const access = {
  userIsAdmin: ({ authentication: { item: user } }) => Boolean(user && user.isAdmin),
  userIsCurrentAuth: ({ authentication: { item: user } }) => Boolean(user), // item will be undefined for anonymous user
};

// Read: public / Write: admin
const DEFAULT_LIST_ACCESS = {
  create: access.userIsAdmin,
  read: true,
  update: access.userIsAdmin,
  delete: access.userIsAdmin,
};

exports.User = {
  access: {
    update: access.userIsCurrentAuth,
    delete: access.userIsAdmin,
  },
  fields: {
    name: { type: Text },
    email: { type: Text, isUnique: true, access: { read: access.userIsCurrentAuth } },
    password: { type: Password, isRequired: true },
    isAdmin: { type: Checkbox, access: { update: access.userIsAdmin } },
    twitterHandle: { type: Text },
    image: { type: CloudinaryImage, adapter: cloudinaryAdapter },
    talks: {
      type: Relationship,
      ref: 'Talk.speakers',
      many: true,
      access: { update: access.userIsAdmin },
    },
  },
  hooks: {
    afterChange: async ({ updatedItem, existingItem }) => {
      if (existingItem && updatedItem.password !== existingItem.password) {
        const url = process.env.SERVER_URL || 'http://localhost:3000';

        const props = {
          recipientEmail: updatedItem.email,
          signinUrl: `${url}/signin`,
        };

        const options = {
          subject: 'Your password has been updated',
          to: updatedItem,
          from: process.env.MAILGUN_FROM,
          domain: process.env.MAILGUN_DOMAIN,
          apiKey: process.env.MAILGUN_API_KEY,
        };

        await sendEmail('password-updated.jsx', props, options);
      }
    },
  },
};

exports.Organiser = {
  access: DEFAULT_LIST_ACCESS,
  fields: {
    user: { type: Relationship, ref: 'User' },
    order: { type: Integer },
    role: { type: Text },
  },
};

// TODO: We can't access the existing item at the list update level yet,
// read access needs to check if event is "active" or if the user is admin
// read: ({ existingItem, authentication }) => access.userIsAdmin({ authentication }) || !!(existingItem && existingItem.status === 'active'),

exports.Event = {
  access: DEFAULT_LIST_ACCESS,
  fields: {
    name: { type: Text },
    status: { type: Select, options: 'draft, active', defaultValue: 'draft' },
    themeColor: { type: Text },
    startTime: { type: DateTime },
    durationMins: { type: Integer },
    description: { type: Wysiwyg },
    talks: { type: Relationship, ref: 'Talk.event', many: true },
    locationAddress: { type: Text },
    locationDescription: { type: Text },
    maxRsvps: { type: Integer, defaultValue: 120 },
    isRsvpAvailable: { type: Checkbox, defaultValue: true },
  },
};

exports.Talk = {
  access: DEFAULT_LIST_ACCESS,
  fields: {
    name: { type: Text },
    event: { type: Relationship, ref: 'Event.talks' },
    speakers: { type: Relationship, ref: 'User.talks', many: true },
    isLightningTalk: { type: Checkbox },
    description: { type: Wysiwyg },
  },
};

exports.Rsvp = {
  access: {
    create: true,
    read: true,
    update: ({ authentication: { item } }) => {
      if (!item) {
        return false;
      }
      return { user: { id: item.id } };
    },
    delete: access.userIsAdmin,
  },
  fields: {
    event: { type: Relationship, ref: 'Event' },
    user: { type: Relationship, ref: 'User' },
    status: { type: Select, options: 'yes, no' },
  },
  hooks: {
    validateInput: async ({ context, resolvedData, existingItem }) => {
      const { status } = resolvedData;
      const { event: eventId } = existingItem ? existingItem : resolvedData;

      if (status === 'no') {
        return;
      }

      const { data } = await context.executeGraphQL({
        query: `query {
        event: Event(where: { id: "${eventId}" }) {
          id
          startTime
          maxRsvps
          isRsvpAvailable
        }
        allRsvps(where: { event: { id: "${eventId}" }}) {
          id
        }
      }`,
      });

      const { event, allRsvps } = data;

      if (
        !event ||
        !event.isRsvpAvailable ||
        !event.startTime ||
        new Date() > new Date(event.startTime) ||
        allRsvps.length >= event.maxRsvps
      ) {
        throw 'Error rsvping to event';
      }
    },
  },
};

exports.Sponsor = {
  access: DEFAULT_LIST_ACCESS,
  fields: {
    name: { type: Text },
    website: { type: Text },
    logo: { type: CloudinaryImage, adapter: cloudinaryAdapter },
  },
};

exports.ForgottenPasswordToken = {
  access: {
    create: true,
    read: true,
    update: access.userIsAdmin,
    delete: access.userIsAdmin,
  },
  fields: {
    user: {
      type: Relationship,
      ref: 'User',
      access: {
        read: access.userIsAdmin,
      },
    },
    token: {
      type: Text,
      isRequired: true,
      isUnique: true,
      access: {
        read: access.userIsAdmin,
      },
    },
    requestedAt: { type: DateTime, isRequired: true },
    accessedAt: { type: DateTime },
    expiresAt: { type: DateTime, isRequired: true },
  },
  hooks: {
    afterChange: async ({ context, updatedItem, existingItem }) => {
      if (existingItem) return null;

      const now = new Date().toISOString();

      const { errors, data } = await context.executeGraphQL({
        context: context.createContext({ skipAccessControl: true }),
        query: `
        query GetUserAndToken($user: ID!, $now: DateTime!) {
          User( where: { id: $user }) {
            id
            email
          }
          allForgottenPasswordTokens( where: { user: { id: $user }, expiresAt_gte: $now }) {
            token
            expiresAt
          }
        }
      `,
        variables: { user: updatedItem.user.toString(), now },
      });

      if (errors) {
        console.error(errors, `Unable to construct password updated email.`);
        return;
      }

      const { allForgottenPasswordTokens, User } = data;
      const forgotPasswordKey = allForgottenPasswordTokens[0].token;
      const url = process.env.SERVER_URL || 'http://localhost:3000';

      const props = {
        forgotPasswordUrl: `${url}/change-password?key=${forgotPasswordKey}`,
        recipientEmail: User.email,
      };

      const options = {
        subject: 'Request for password reset',
        to: User.email,
        from: process.env.MAILGUN_FROM,
        domain: process.env.MAILGUN_DOMAIN,
        apiKey: process.env.MAILGUN_API_KEY,
      };

      await sendEmail('forgot-password.jsx', props, options);
    },
  },
};

exports.customSchema = {
  mutations: [
    {
      schema: 'startPasswordRecovery(email: String!): ForgottenPasswordToken',
      resolver: async (obj, { email }, context) => {
        const token = uuid();

        const tokenExpiration =
          parseInt(process.env.RESET_PASSWORD_TOKEN_EXPIRY) || 1000 * 60 * 60 * 24;

        const now = Date.now();
        const requestedAt = new Date(now).toISOString();
        const expiresAt = new Date(now + tokenExpiration).toISOString();

        const { errors: userErrors, data: userData } = await context.executeGraphQL({
          context: context.createContext({ skipAccessControl: true }),
          query: `
            query findUserByEmail($email: String!) {
              allUsers(where: { email: $email }) {
                id
                email
              }
            }
          `,
          variables: { email: email },
        });

        if (userErrors || !userData.allUsers || !userData.allUsers.length) {
          console.error(
            userErrors,
            `Unable to find user when trying to create forgotten password token.`
          );
          return;
        }

        const userId = userData.allUsers[0].id;

        const result = {
          userId,
          token,
          requestedAt,
          expiresAt,
        };

        const { errors } = await context.executeGraphQL({
          context: context.createContext({ skipAccessControl: true }),
          query: `
            mutation createForgottenPasswordToken(
              $userId: ID!,
              $token: String,
              $requestedAt: DateTime,
              $expiresAt: DateTime,
            ) {
              createForgottenPasswordToken(data: {
                user: { connect: { id: $userId }},
                token: $token,
                requestedAt: $requestedAt,
                expiresAt: $expiresAt,
              }) {
                id
                token
                user {
                  id
                }
                requestedAt
                expiresAt
              }
            }
          `,
          variables: result,
        });

        if (errors) {
          console.error(errors, `Unable to create forgotten password token.`);
          return;
        }

        return true;
      },
    },
    {
      schema: 'changePasswordWithToken(token: String!, password: String!): User',
      resolver: async (obj, { token, password }, context) => {
        const now = Date.now();

        const { errors, data } = await context.executeGraphQL({
          context: context.createContext({ skipAccessControl: true }),
          query: `
            query findUserFromToken($token: String!, $now: DateTime!) {
              passwordTokens: allForgottenPasswordTokens(where: { token: $token, expiresAt_gte: $now }) {
                id
                token
                user {
                  id
                }
              }
            }`,
          variables: { token, now },
        });

        if (errors || !data.passwordTokens || !data.passwordTokens.length) {
          console.error(errors, `Unable to find token`);
          throw errors.message;
        }

        const user = data.passwordTokens[0].user.id;
        const tokenId = data.passwordTokens[0].id;

        const { errors: passwordError } = await context.executeGraphQL({
          context: context.createContext({ skipAccessControl: true }),
          query: `mutation UpdateUserPassword($user: ID!, $password: String!) {
            updateUser(id: $user, data: { password: $password }) {
              id
            }
          }`,
          variables: { user, password },
        });

        if (passwordError) {
          console.error(passwordError, `Unable to change password`);
          throw passwordError.message;
        }

        await context.executeGraphQL({
          context: context.createContext({ skipAccessControl: true }),
          query: `mutation DeletePasswordToken($tokenId: ID!) {
            deleteForgottenPasswordToken(id: $tokenId) {
              id
            }
          }
        `,
          variables: { tokenId },
        });

        return true;
      },
    },
  ],
};
