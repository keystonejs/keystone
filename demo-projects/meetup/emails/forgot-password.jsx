const React = require('react');

module.exports = ({ recipientEmail, forgotPasswordUrl }) => (
  <html>
    <body>
      <div>
        <p>Hi {recipientEmail}</p>
        <div>
          <p>
            We have received your request to reset your password. Please follow the link below to
            reset your password.
          </p>
          <ul>
            <li>
              <a href={forgotPasswordUrl} target="_blank">
                Reset Password
              </a>
            </li>
          </ul>
          <p>If you didn’t ask for your password to be reset, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
  </html>
);
