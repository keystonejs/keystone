const { AdminUI } = require('@keystonejs/admin-ui');
const { Keystone } = require('@keystonejs/core');
const {
  Text,
  Relationship,
  Select,
  Password,
  CloudinaryImage,
} = require('@keystonejs/fields');
const { WebServer } = require('@keystonejs/server');

const PasswordAuthStrategy = require('@keystonejs/core/auth/Password');
const { CloudinaryAdapter } = require('@keystonejs/file-adapters');

const { port, cloudinary } = require('./config');

const initialData = require('./data');

const cloudinaryAdapter = new CloudinaryAdapter({
  ...cloudinary,
  folder: 'ask-dave',
});

const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');

const keystone = new Keystone({
  name: 'breville-askdave',
  adapter: new MongooseAdapter(),
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    password: { type: Password },
    company: {
      type: Select,
      options: [
        { label: 'Thinkmill', value: 'thinkmill' },
        { label: 'Breville', value: 'breville' },
      ],
    },
  },
  labelResolver: item => `${item.name} <${item.email}>`,
});

keystone.createList('Ingredient', {
  fields: {
    name: { type: Text },
    description: { type: Text },
    image: { type: CloudinaryImage, adapter: cloudinaryAdapter },
  },
});

keystone.createList('Technique', {
  fields: {
    name: { type: Text },
    description: { type: Text },
    image: { type: CloudinaryImage, adapter: cloudinaryAdapter },
  },
});

keystone.createList('Doneness', {
  fields: {
    name: { type: Text },
    description: { type: Text },
    image: { type: CloudinaryImage, adapter: cloudinaryAdapter },
  },
});

keystone.createList('KitchenWare', {
  fields: {
    name: { type: Text },
    description: { type: Text },
    image: { type: CloudinaryImage, adapter: cloudinaryAdapter },
  },
});

keystone.createList('Answer', {
  labelResolver: item =>
    `${item.ingredient} | ${item.technique}${item.doneness &&
      ` | ${item.doneness}`}`,
  fields: {
    ingredient: {
      type: Relationship,
      ref: 'Ingredient',
    },
    technique: {
      type: Relationship,
      ref: 'Technique',
    },
    doneness: {
      type: Relationship,
      ref: 'Doneness',
    },
    sensor: {
      type: Select,
      options: [
        { label: 'Probe control', value: 'probe' },
        { label: 'Pan', value: 'pan' },
      ],
    },
    intensity: {
      type: Select,
      options: [
        { label: 'Slow', value: 'slow' },
        { label: 'Medium', value: 'medium' },
        { label: 'Fast', value: 'fast' },
        { label: 'Max', value: 'max' },
      ],
    },
    tempCelsius: { type: Text, label: 'Celsius Temp' },
    tempFahrenheit: { type: Text, label: 'Fahrenheit Temp' },
    equipment: {
      type: Relationship,
      ref: 'KitchenWare',
      many: true,
    },
    comment: { type: Text },
  },
});

const admin = new AdminUI(keystone, {
  adminPath: '/admin',
  authStrategy,
});

const server = new WebServer(keystone, {
  'cookie secret': 'qwerty',
  'admin ui': admin,
  session: true,
  port,
});

async function start() {
  keystone.connect();
  server.start();
  const users = await keystone.lists.User.model.find();
  if (!users.length) {
    await keystone.createItems(initialData);
  }
}

start();
