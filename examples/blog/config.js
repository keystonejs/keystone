module.exports = {
  port: process.env.PORT || 3000,
  staticRoute: '/public', // The URL portion
  staticPath: 'public', // The local path on disk
  distDir: 'dist',
};
