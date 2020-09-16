const React = require('react');

module.exports = ({ recipientEmail, signinUrl }) => (
  <html>
    <body>
      <div>
        <p>Hi {recipientEmail}</p>
        <div>
          <p>
            Your password has been updated you can log in{' '}
            <a href={signinUrl} target="_blank">
              here
            </a>
          </p>
        </div>
      </div>
    </body>
  </html>
);
