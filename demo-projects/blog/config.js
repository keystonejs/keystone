const path = require('path');

// config
exports.staticRoute = '/public'; // The URL portion
exports.staticPath = path.join(process.cwd(), 'public'); // The local path on disk
exports.port = 3000;
