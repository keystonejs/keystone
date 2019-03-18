const keystone = require('@keystone-alpha/core');
const express = require('express');
const path = require('path');

keystone
  .prepare({
    port: 3000,
  })
  .then(({ server }) => {
    server.app.use(express.static(path.join(__dirname, 'public')));
    return server.start();
  })
  .then(({ port }) => {
    console.log(`Listening on port ${port}`);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
