const View = require('@keystone-alpha/view');
const { format } = require('date-fns');

module.exports = (keystone, app) => {

  app.use('/', async (req, res) => {
    const locals = res.locals || {};
    locals.format = format;
    const view = new View(keystone, req, res);
    // const Post = keystone.getListByKey('Post').adapter;
    // view.query('posts', Post.model.find());
    view.query('posts', `{
      allPosts {
        title
        id
        body
        posted
        image {
          publicUrl
          filename
        }
        author {
          name
        }
      }
    }`);

    view.query('status', keystone.getListByKey('Post').adapter.model.find({ id: 'test', author: { $in : ['abc', 'xyz'] } }).populate('author'));
    view.render('views/home', locals);
  });
};
