const {
  Checkbox,
  DateTime,
  Integer,
  Password,
  Relationship,
  Select,
  Text,
} = require('@keystone-alpha/fields');
const { Wysiwyg } = require('@keystone-alpha/fields-wysiwyg-tinymce');

exports.User = {
  fields: {
    name: { type: Text },
    email: { type: Text, isUnique: true },
    password: { type: Password },
    isAdmin: { type: Checkbox },
    talks: { type: Relationship, ref: 'Talk', many: true },
    rsvps: { type: Relationship, ref: 'Rsvp', many: true },
  },
};

exports.Event = {
  fields: {
    name: { type: Text },
    status: { type: Select, options: 'draft, active' },
    startDate: { type: DateTime },
    durationMins: { type: Integer },
    description: { type: Wysiwyg },
    talks: { type: Relationship, ref: 'Talk', many: true },
    maxRSVPs: { type: Integer },
  },
};

exports.Talk = {
  fields: {
    name: { type: Text },
    event: { type: Relationship, ref: 'Event' },
    speaker: { type: Relationship, ref: 'User' },
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
