const prompts = require('prompts');
const slugify = require('@sindresorhus/slugify');
const { getArgs } = require('./get-args');

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
    description: 'Connect to a PostgreSQL database with knex.',
    removeDependencies: ['@keystonejs/adapter-mongoose'],
    defaultConfig: name => `postgres://localhost/${slugify(name, { separator: '_' })}`,
  },
  Prisma: {
    name: 'Prisma (Experimental)',
    file: 'adapter-prisma.js',
    dependencies: ['@keystonejs/adapter-prisma'],
    description: 'Connect to a PostgreSQL database with Prisma (Experimental).',
    removeDependencies: ['@keystonejs/adapter-mongoose'],
    defaultConfig: () => `e.g. postgres://user:password@localhost:5432/db_name`,
  },
};

const choices = Object.entries(adapters).map(([key, value]) => ({
  value: { ...value, key },
  title: value.name,
  description: value.description,
}));

let ADAPTER_CHOICE;

const getAdapterChoice = async () => {
  // If we already have the project name return it
  if (ADAPTER_CHOICE) {
    return ADAPTER_CHOICE;
  }

  // If the database option was provided via the CLI arguments
  const args = getArgs();
  const argValue = args['--database'];
  if (argValue) {
    if (adapters[argValue]) {
      ADAPTER_CHOICE = adapters[argValue];
      return ADAPTER_CHOICE;
    }

    const foundArg = Object.values(adapters).find(
      adapter => adapter.name.toLowerCase() === argValue.trim().toLowerCase()
    );
    if (foundArg) {
      ADAPTER_CHOICE = foundArg.name;
      return ADAPTER_CHOICE;
    }
    console.error('Invalid --database value:', argValue);
  }

  // Prompt for an adapter

  const response = await prompts(
    {
      type: 'select',
      name: 'value',
      message: 'Select a database type',
      choices,
      initial: 0,
      onCancel: () => {
        return true;
      },
    },
    {
      onCancel: () => {
        process.exit(0);
      },
    }
  );
  ADAPTER_CHOICE = response.value;

  return ADAPTER_CHOICE;
};

module.exports = { getAdapterChoice };
