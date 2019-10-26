const adapters = {
  Mongoose: {
    file: 'adapter-mongoose.js',
    dependencies: ['@keystonejs/adapter-mongoose'],
    description: 'Connect to a Mongo database.',
  },
  Knex: {
    file: 'adapter-knex.js',
    dependencies: ['@keystonejs/adapter-knex'],
    description: 'Connect to a Postgres database.',
    removeDependencies: ['@keystonejs/adapter-mongoose'],
  },
};

const projects = [
  {
    folder: 'starter',
    title: 'Starter (Users + Authentication)',
    description: 'Simple stating point with users and basic authentication.',
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
