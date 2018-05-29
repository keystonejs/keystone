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

const keystone = new Keystone({
  name: 'breville-askdave',
});

keystone.createAuthStrategy({
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
  // defaultColumns: ['ingredient', 'technique', 'doneness', 'sensor', 'intensity', 'tempCelsius', 'tempFahrenheit'],
  // defaultSort: 'comment',
  // labelField: 'comment',
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

const admin = new AdminUI(keystone, '/admin');

const server = new WebServer(keystone, {
  'cookie secret': 'qwerty',
  'admin ui': admin,
  session: true,
  port,
});

server.app.use(
  keystone.session.validate({
    valid: ({ req, item }) => (req.user = item),
  })
);

server.app.get('/api/session', (req, res) => {
  const data = {
    signedIn: !!req.session.keystoneItemId,
    userId: req.session.keystoneItemId,
  };
  if (req.user) {
    Object.assign(data, {
      name: req.user.name,
    });
  }
  res.json(data);
});

server.app.get('/api/signin', async (req, res, next) => {
  try {
    const result = await keystone.auth.User.password.validate({
      username: req.query.username,
      password: req.query.password,
    });
    if (!result.success) {
      return res.json({
        success: false,
      });
    }
    await keystone.session.create(req, result);
    res.json({
      success: true,
      itemId: result.item.id,
    });
  } catch (e) {
    next(e);
  }
});

server.app.get('/api/signout', async (req, res, next) => {
  try {
    await keystone.session.destroy(req);
    res.json({
      success: true,
    });
  } catch (e) {
    next(e);
  }
});

// server.app.get('/reset-db', (req, res) => {
//   const reset = async () => {
//     await keystone.mongoose.connection.dropDatabase();
//     await keystone.createItems(initialData);
//     res.redirect(admin.adminPath);
//   };
//   reset();
// });

async function start() {
  keystone.connect();
  server.start();
  const users = await keystone.lists.User.model.find();
  if (!users.length) {
    await keystone.mongoose.connection.dropDatabase();
    await keystone.createItems(initialData);
  }
}

start();
