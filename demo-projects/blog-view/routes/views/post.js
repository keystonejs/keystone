const View = require('@keystone-alpha/view');
const bodyParser = require('body-parser');
const { format } = require('date-fns');

module.exports = (keystone, app) => {
  app.use('/post?:id', bodyParser.urlencoded({ extended: true }), async (req, res) => {
    const locals = res.locals || {};
    locals.post = req.query.id;
    locals.user = req.user && req.user.id;
    locals.format = format;
    locals.imagePlaceholder = name => `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width="100" height="100">
    <rect width="100" height="100" fill="hsl(200,20%,50%)" />
    <text text-anchor="middle" x="50" y="67" fill="white" style="font-size: 50px; font-family: 'Rubik', sans-serif;">
    ${name.charAt(0)}</text></svg>`;
    const view = new View(keystone, req, res);

    view.on('post', async () => {
      const { author, comment } = req.body;
      view
        .query(
          'c1',
          `mutation {
            createComment(data: {originalPost: { 
                connect: {id: "${locals.post}"}
              }, 
              body: "${comment}", 
              author: {connect: { id: "${author}"}} , 
              posted: "${new Date().toISOString()}"}
            ) {
              id
            }
          }`
        )
        .err(console.log);
    });

    view.query(
      'post',
      `{
          Post(where: { id: "${req.query.id}" }) {
            title
            body
            posted
            id
            image {
              publicUrl
            }
            author {
              name
            }
          }
    
          allComments(where: { 
              originalPost: { id: "${req.query.id}"  } 
          }) {
            id
            body
            author {
              name
              avatar {
                publicUrl
              }
            }
            posted
          }
      }`
    );

    view.query(
      'demoUser',
      `{ 
          allUsers(where: { email: "a@demo.user" }) {
            name
            email
            id
          }
      }`
    );

    view.render('views/post', locals);
  });
};
