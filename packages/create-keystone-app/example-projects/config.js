const slugify = require('@sindresorhus/slugify');

const adapters = {
  MongoDB: {
    name: 'MongoDB',
    file: 'adapter-mongoose.js',
    dependencies: ['@keystonejs/adapter-mongoose'],
    description: 'Connect to a MongoDB database.',
    defaultConfig: name => `mongodb://localhost/${slugify(name)}`,
  },
  PostgreSQL: {
    name: 'PostgreSQL',
    file: 'adapter-knex.js',
    dependencies: ['@keystonejs/adapter-knex'],
    description: 'Connect to a PostgreSQL database.',
    removeDependencies: ['@keystonejs/adapter-mongoose'],
    defaultConfig: name => `postgres://localhost/${slugify(name, { separator: '_' })}`,
  },
};

const projects = [
  {
    folder: 'starter',
    title: 'Starter (Users + Authentication)',
    description: 'Simple starting point with users and basic authentication.',
    adapters,
  },
  {
    folder: 'blank',
    title: 'Blank',
    description:
      'A completely blank project. Provides an AdminUI, and GraphQL App ready for you configure. ',
    adapters,
  },
  {
    folder: 'todo',
    title: 'Todo',
    description:
      'A very simple Todo app with a static front-end written in good old HTML, CSS and JavaScript.',
    adapters,
  },
  {
    folder: 'nuxt',
    title: 'Nuxt',
    description: 'A simple app using the NuxtJS front-end framework.',
    adapters,
  },
];

module.exports = {
  projects,
};
