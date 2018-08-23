const path = require('path');

exports.port = process.env.PORT || 3000;
exports.appURL = process.env.APP_URL || `http://localhost:${exports.port}`;
exports.projectName = process.env.PROJECT_NAME || 'Cypress Test Project for Access Control';

exports.staticRoute = '/public'; // The URL portion
exports.staticPath = path.join(process.cwd(), 'public'); // The local path on disk
