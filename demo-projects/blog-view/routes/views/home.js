const View = require('@keystone-alpha/view');
const { format } = require('date-fns');

module.exports = (keystone, app) => {
  app.use('/', async (req, res) => {
    const locals = res.locals || {};
    locals.format = format;
    const view = new View(keystone, req, res);
    view.query(
      'posts',
      `{ 
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
      }`
    );

    view.render('views/home', locals);
  });
};
