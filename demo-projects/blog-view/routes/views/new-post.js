const View = require('@keystone-alpha/view');
const { format } = require('date-fns');
const multer = require('multer');
const { Readable } = require('stream');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');

function bufferToStream(buffer) {
  const newStream = new Readable();
  newStream.push(buffer);
  newStream.push(null);
  return newStream;
}

module.exports = (keystone, app) => {
  app.use('/new', upload, async (req, res) => {
    const locals = res.locals || {};
    locals.format = format;
    locals.imagePlaceholder = name => `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width="100" height="100">
    <rect width="100" height="100" fill="hsl(200,20%,50%)" />
    <text text-anchor="middle" x="50" y="67" fill="white" style="font-size: 50px; font-family: 'Rubik', sans-serif;">
    ${name.charAt(0)}</text></svg>`;
    const view = new View(keystone, req, res);

    view.on('post', async () => {
      const { title, body, admin } = req.body;
      const input = { title, body, author: { connect: { id: admin } } };
      if (req.file) {
        const { buffer, originalname: filename, mimetype, encoding } = req.file;
        input['image'] = { stream: bufferToStream(buffer), filename, mimetype, encoding };
      }
      view
        .query(
          'created',
          `mutation createPost($input: PostCreateInput){
            createPost(data: $input) {id}
          }`,
          { variables: { input } }
        )
        .err(err => {
          console.log(err);
          locals.err = err;
        });
    });

    view.query(
      'allUsers',
      `{
        allUsers(where: { isAdmin: true }) {
          name
          email
          id
        }
      }`
    );

    view.render('views/new-post', locals);
  });
};
