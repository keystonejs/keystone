const {
  Text,
  Relationship,
  Select,
  Password,
  Checkbox,
  CalendarDay,
} = require('@keystone-alpha/fields');
const { Wysiwyg } = require('@keystone-alpha/fields-wysiwyg-tinymce');

exports.User = {
  fields: {
    name: { type: Text },
    email: { type: Text, isUnique: true },
    password: { type: Password },
    isAdmin: { type: Checkbox },
    talks: { type: Relationship, ref: 'Talk' },
  },
};

exports.Meetup = {
  fields: {
    name: { type: Text },
    status: { type: Select, options: 'draft, active' },
    day: { type: CalendarDay },
    description: { type: Wysiwyg },
    talks: { type: Relationship, ref: 'Talk' },
  },
};

exports.Talk = {
  fields: {
    name: { type: Text },
    meetup: { type: Relationship, ref: 'Meetup' },
    speaker: { type: Relationship, ref: 'User' },
    description: { type: Wysiwyg },
  },
};
