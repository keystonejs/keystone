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
    talks: { type: Relationship, ref: 'Talk.speakers', many: true },
  },
};

exports.Event = {
  fields: {
    name: { type: Text },
    status: { type: Select, options: 'draft, active' },
    startDate: { type: DateTime },
    durationMins: { type: Integer },
    description: { type: Wysiwyg },
    talks: { type: Relationship, ref: 'Talk.event', many: true },
    maxRSVPs: { type: Integer },
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
