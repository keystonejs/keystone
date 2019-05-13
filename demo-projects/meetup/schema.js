require('dotenv').config();

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

exports.Sponsor = {
  fields: {
    name: { type: Text },
    website: { type: Text },
    logo: { type: CloudinaryImage, adapter: cloudinaryAdapter },
  },
};

exports.Organiser = {
  fields: {
    user: { type: Relationship, ref: 'User' },
    order: { type: Number },
    role: { type: Text },
  },
};

exports.User = {
  fields: {
    name: { type: Text },
    email: { type: Text, isUnique: true },
    password: { type: Password },
    isAdmin: { type: Checkbox },
    twitterHandle: { type: Text },
    image: { type: CloudinaryImage, adapter: cloudinaryAdapter },
    talks: { type: Relationship, ref: 'Talk.speakers', many: true },
  },
};

exports.Event = {
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
  fields: {
    name: { type: Text },
    event: { type: Relationship, ref: 'Event.talks' },
    speakers: { type: Relationship, ref: 'User.talks', many: true },
    isLightningTalk: { type: Checkbox },
    description: { type: Wysiwyg },
  },
};

exports.Rsvp = {
  fields: {
    event: { type: Relationship, ref: 'Event' },
    user: { type: Relationship, ref: 'User' },
    status: { type: Select, options: 'yes, no' },
  },
};
