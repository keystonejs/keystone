const home = require('./views/home');
const post = require('./views/post');
const newPost = require('./views/new-post');
module.exports = (keystone, app) => {
  post(keystone, app);
  newPost(keystone, app);
  home(keystone, app);
};
