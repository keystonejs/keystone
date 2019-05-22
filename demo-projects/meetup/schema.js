require('dotenv').config();
const { sendEmail } = require('../emails');

const {
  CloudinaryImage,
  Checkbox,
  DateTime,
  Integer,
  Password,
  Relationship,
  Select,
  Text,
} = require('@keystone-alpha/fields');
const { CloudinaryAdapter } = require('@keystone-alpha/file-adapters');
const { Wysiwyg } = require('@keystone-alpha/fields-wysiwyg-tinymce');

const cloudinaryAdapter = new CloudinaryAdapter({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_KEY,
  apiSecret: process.env.CLOUDINARY_SECRET,
});

const access = {
  userIsAdmin: ({ authentication: { item: user } }) => !!(user && user.isAdmin),
  userIsAdminOrPath: path => ({ existingItem: item, authentication: { item: user } }) => {
    if (!user) return false;
    return user.isAdmin || user.id === item[path];
  },
};

access.readPublicWriteAdmin = {
  create: access.userIsAdmin,
  read: true,
  update: access.userIsAdmin,
  delete: access.userIsAdmin,
};

// TODO: We can't access the existing item at the list update level yet,
// so this kludge will allow the access control to work for now by
// locking down the API to admins.
access.userIsAdminOrPath = () => access.userIsAdmin;

exports.User = {
  access: {
    update: access.userIsAdminOrPath('id'),
    delete: access.userIsAdmin,
  },
  fields: {
    name: { type: Text },
    email: { type: Text, isUnique: true, access: { read: access.userIsAdminOrPath('id') } },
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
};

exports.Organiser = {
  access: access.readPublicWriteAdmin,
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
  access: access.readPublicWriteAdmin,
  fields: {
    name: { type: Text },
    status: { type: Select, options: 'draft, active' },
    themeColor: { type: Text },
    startTime: { type: DateTime },
    durationMins: { type: Integer },
    description: { type: Wysiwyg },
    talks: { type: Relationship, ref: 'Talk.event', many: true },
    locationAddress: { type: Text },
    locationDescription: { type: Text },
    maxRsvps: { type: Integer },
    isRsvpAvailable: { type: Checkbox },
  },
};

exports.Talk = {
  access: access.readPublicWriteAdmin,
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
    update: access.userIsAdminOrPath('user'),
    delete: access.userIsAdmin,
  },
  fields: {
    event: { type: Relationship, ref: 'Event' },
    user: { type: Relationship, ref: 'User' },
    status: { type: Select, options: 'yes, no' },
  },
  hooks: {
    validateInput: async ({ resolvedData, existingItem, actions }) => {
      const { status } = resolvedData;
      const { event: eventId } = existingItem ? existingItem : resolvedData;

      if (status === 'no') {
        return;
      }

      const { data } = await actions.query(`query {
        event: Event(where: { id: "${eventId}" }) {
          id
          startTime
          maxRsvps
          isRsvpAvailable
        }
        allRsvps(where: { event: { id: "${eventId}" }}) {
          id
        }
      }`);

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
  access: access.readPublicWriteAdmin,
  fields: {
    name: { type: Text },
    website: { type: Text },
    logo: { type: CloudinaryImage, adapter: cloudinaryAdapter },
  },
};

exports.ForggottenPasswordToken = {
  fields: {
    user: { type: Relationship, ref: 'User' },
    token: { type: Text, isRequired: true, isUnique: true },
    requestedAt: { type: DateTime, isRequired: true },
    accessedAt: { type: DateTime },
    expiresAt: { type: DateTime, isRequired: true },
  },
  hooks: {
    afterChange: async ({ updatedItem, existingItem, actions: { query } }) => {
      if (existingItem) return null;

      const now = new Date.toISOString();

      const { errors, data } = await query(
        `
        query GetUserAndToken($user: ID!, $now: DateTime!) {
          User( where: { id: $user }) {
            id
            name
            email
          }
          allForgottenPasswordTokens( where: { user: { id: $user }, expiresAt_gte: $now }) {
            token
            expiresAt
          }
        }
      `,
        { skipAccessControl: true, variables: { user: updatedItem.user.id, now } }
      );

      if (errors) {
        console.error(errors, `Unable to construct password updated email.`);
        return;
      }

      const { allForgottenPasswordTokens, user } = data;
      const forgotPasswordKey = allForgottenPasswordTokens[0].token;
      const url = process.env.SERVER_URL || 'http://localhost:3000';

      const locals = {
        forgotPasswordUrl: `${url}/change-password?key=${forgotPasswordKey}`,
        recipientName: user.name,
        recipientEmail: user.email,
      };
      const options = {
        subject: 'Request for password reset',
        to: user.email,
        from: 'sean@thinkmill.com',
        domain: process.env.MAILGUN_DOMAIN,
        apiKey: process.env.MAILGUN_API_KEY,
      };

      sendEmail('forgot-password.jade', options, locals);
    },
  },
  mutations: [{}],
};
