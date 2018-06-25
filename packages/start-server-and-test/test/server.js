const http = require('http');
const server = http.createServer((req, res) => {
  console.log(req.method)
  if (req.method === 'GET') {
    res.end('All good\n\n')
  } else {
    res.end();
  }
});
setTimeout(() => {
  server.listen(9000)
  console.log('listening at port 9000')
}, 5000)
console.log('sleeping for 5 seconds before starting')
