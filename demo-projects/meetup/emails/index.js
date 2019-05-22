const emailSender = require('@keystone-alpha/email');

const jsxEmailSender = emailSender.jade({ root: __dirname, transport: 'mailgun' });

const sendEmail = (templatePath, options, locals = {}) => {
  if (!templatePath) {
    console.error('No template path provided');
  }
  return jsxEmailSender(templatePath).send(locals, options);
};

module.exports = {
  sendEmail,
};
