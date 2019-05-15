module.exports = {
  User: [
    { name: 'Admin User', email: 'admin@keystonejs.com', isAdmin: true, password: 'password' },
    {
      name: 'Organiser 1',
      email: 'organiser1@keystonejs.com',
      twitterHandle: '@organiser1',
      password: 'passwordorganiser1',
    },
    {
      name: 'Organiser 2',
      email: 'organiser2@keystonejs.com',
      twitterHandle: '@organiser2',
      password: 'passwordorganiser2',
    },
    {
      name: 'Organiser 3',
      email: 'organiser3@keystonejs.com',
      twitterHandle: '@organiser3',
      password: 'passwordorganiser3',
    },
    {
      name: 'Speaker 1',
      email: 'speaker1@keystonejs.com',
      twitterHandle: '@speaker1',
      password: 'passwordspeaker1',
    },
    {
      name: 'Speaker 2',
      email: 'speaker2@keystonejs.com',
      twitterHandle: '@speaker2',
      password: 'passwordspeaker2',
    },
    {
      name: 'Speaker 3',
      email: 'speaker3@keystonejs.com',
      twitterHandle: '@speaker3',
      password: 'passwordspeaker3',
    },
    {
      name: 'Attendee 1',
      email: 'attendee1@keystonejs.com',
      twitterHandle: `@attendee1`,
      password: 'passwordattendee1',
    },
    {
      name: 'Attendee 2',
      email: 'attendee2@keystonejs.com',
      twitterHandle: `@attendee2`,
      password: 'passwordattendee2',
    },
    {
      name: 'Attendee 3',
      email: 'attendee3@keystonejs.com',
      twitterHandle: `@attendee3`,
      password: 'passwordattendee3',
    },
  ],
  Organiser: [
    { user: { where: { name: 'Organiser 1' } }, order: 1, role: 'Organiser' },
    { user: { where: { name: 'Organiser 2' } }, order: 2, role: 'Organiser' },
    { user: { where: { name: 'Organiser 3' } }, order: 3, role: 'Organiser' },
  ],
  Event: [
    {
      name: 'Keystone Launch',
      status: 'active',
      themeColor: '#334455',
      startTime: '2019-05-15T18:00:00+11:00',
      durationMins: 150,
      maxRsvps: 120,
    },
  ],
  Talk: [{ name: 'Introducing Keystone 5 🎉' }, { name: 'Keystone 5 - Under the hood' }],
  Rsvp: [],
  Sponsor: [{ name: 'Thinkmill', website: 'https://www.thinkmill.com.au' }],
};
