const path = require('path');

exports.port = process.env.PORT || 3000;
exports.staticRoute = '/public'; // The URL portion
exports.staticPath = path.join(process.cwd(), 'public'); // The local path on disk
