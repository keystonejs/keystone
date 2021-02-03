const { emailSender } = require('@keystonejs/email');

const jsxEmailSender = emailSender.jsx({
  root: __dirname,
  transport: 'mailgun',
});

const sendEmail = (templatePath, rendererProps, options) => {
  if (!templatePath) {
    console.error('No template path provided');
  }
  return jsxEmailSender(templatePath).send(rendererProps, options);
};

module.exports = {
  sendEmail,
};
