exports.port = process.env.PORT || 3000;
exports.appURL = process.env.APP_URL || `http://localhost:${exports.port}`;
exports.projectName = process.env.PROJECT_NAME || 'Cypress Test Project for Access Control';
