module.exports = {
  User: [
    { name: 'Admin User', email: 'admin@keystonejs.com', isAdmin: true, password: 'password' },
    {
      name: 'Jed Watson',
      email: 'organiser1@keystonejs.com',
      twitterHandle: '@JedWatson',
      password: 'passwordorganiser1',
    },
    {
      name: 'Jess Telford',
      email: 'organiser2@keystonejs.com',
      twitterHandle: '@JessTelford',
      password: 'passwordorganiser2',
    },
    {
      name: 'John Molomby',
      email: 'organiser3@keystonejs.com',
      twitterHandle: '@thethinkmill',
      password: 'passwordorganiser3',
    },
    {
      name: 'Tim Leslie',
      email: 'speaker1@keystonejs.com',
      twitterHandle: '@timl',
      password: 'passwordspeaker1',
    },
    {
      name: 'Mitchell Hamilton',
      email: 'speaker2@keystonejs.com',
      twitterHandle: '@mitchellhamiltn',
      password: 'passwordspeaker2',
    },
    {
      name: 'Nathan Simpson',
      email: 'speaker3@keystonejs.com',
      twitterHandle: '@nathansimpson95',
      password: 'passwordspeaker3',
    },
    {
      name: 'Joss Mackison',
      email: 'attendee1@keystonejs.com',
      twitterHandle: `@JossMackison`,
      password: 'passwordattendee1',
    },
    {
      name: 'Simon Vrachliotis',
      email: 'attendee2@keystonejs.com',
      twitterHandle: `@simonswiss`,
      password: 'passwordattendee2',
    },
    {
      name: 'Tuan Hoang',
      email: 'attendee3@keystonejs.com',
      twitterHandle: `@thethinkmill`,
      password: 'passwordattendee3',
    },
  ],
  Organiser: [
    { user: { where: { name: 'Jed Watson' } }, order: 1, role: 'Organiser' },
    { user: { where: { name: 'Jess Telford' } }, order: 2, role: 'Organiser' },
    { user: { where: { name: 'John Molomby' } }, order: 3, role: 'Organiser' },
  ],
  Event: [
    {
      name: 'Keystone Launch',
      status: 'active',
      themeColor: '#334455',
      startTime: '2019-05-15T18:00:00+11:00',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed consequat, est et porttitor ultricies, odio nisi consequat arcu, eget ultrices nulla elit in augue. Fusce accumsan mattis felis eget lacinia. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Praesent commodo velit id cursus bibendum. Vivamus pellentesque, velit semper ullamcorper ullamcorper, massa mauris laoreet odio, vitae hendrerit orci lacus sit amet augue.',
      durationMins: 150,
      maxRsvps: 120,
    },
    {
      name: 'Keystone Beta Launch',
      status: 'active',
      themeColor: '#334455',
      startTime: '2018-12-11T18:00:00+11:00',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed consequat, est et porttitor ultricies, odio nisi consequat arcu, eget ultrices nulla elit in augue. Fusce accumsan mattis felis eget lacinia. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Praesent commodo velit id cursus bibendum. Vivamus pellentesque, velit semper ullamcorper ullamcorper, massa mauris laoreet odio, vitae hendrerit orci lacus sit amet augue.',
      durationMins: 150,
      maxRsvps: 120,
    },
    {
      name: 'Keystone Alpha Launch',
      status: 'active',
      themeColor: '#334455',
      startTime: '2018-10-09T18:00:00+11:00',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed consequat, est et porttitor ultricies, odio nisi consequat arcu, eget ultrices nulla elit in augue. Fusce accumsan mattis felis eget lacinia. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Praesent commodo velit id cursus bibendum. Vivamus pellentesque, velit semper ullamcorper ullamcorper, massa mauris laoreet odio, vitae hendrerit orci lacus sit amet augue.',
      durationMins: 150,
      maxRsvps: 120,
    },
  ],
  Talk: [
    {
      name: 'Introducing Keystone 5 🎉',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed consequat, est et porttitor ultricies, odio nisi consequat arcu, eget ultrices nulla elit in augue. Fusce accumsan mattis felis eget lacinia. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Praesent commodo velit id cursus bibendum. Vivamus pellentesque, velit semper ullamcorper ullamcorper, massa mauris laoreet odio, vitae hendrerit orci lacus sit amet augue.',
    },
    {
      name: 'Keystone 5 - Under the hood',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed consequat, est et porttitor ultricies, odio nisi consequat arcu, eget ultrices nulla elit in augue. Fusce accumsan mattis felis eget lacinia. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Praesent commodo velit id cursus bibendum. Vivamus pellentesque, velit semper ullamcorper ullamcorper, massa mauris laoreet odio, vitae hendrerit orci lacus sit amet augue.',
    },
  ],
  Rsvp: [],
  Sponsor: [{ name: 'Thinkmill', website: 'https://www.thinkmill.com.au' }],
};
