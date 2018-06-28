const path = require('path');

exports.port = process.env.PORT;
exports.appURL = process.env.APP_URL || `http://localhost:${exports.port}`;

exports.staticRoute = '/public'; // The URL portion
exports.staticPath = path.join(process.cwd(), 'public'); // The local path on disk
