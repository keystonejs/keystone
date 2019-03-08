const Email = require('keystone-email');
const expressReactViews = require('express-react-views');
const memoize = require('memoize-one');
const pify = require('pify');
const fs = require('fs');
const mjml2html = require('mjml');

// Returns an instance of `keystone-email`:
// https://github.com/keystonejs/keystone-email
function jsxFactory({ onRender } = {}) {
  return ({ root, transport, expressReactViewsOptions, engine, ...transportOptions }) => {
    if (!root || !fs.existsSync(root)) {
      throw new Error(`'root' must be a valid directory for email views. Got '${root}'.`);
    }

    const emailEngine = expressReactViews.createEngine(expressReactViewsOptions);

    return memoize(template =>
      pify(
        new Email(template, {
          root,
          transport,
          ext: 'jsx',
          engine: (filename, options, cb) =>
            emailEngine(
              filename,
              {
                ...options,
                settings: {
                  views: root,
                  env: process.env.NODE_ENV,
                },
              },
              (error, html) => {
                if (typeof onRender == 'function') {
                  onRender(error, html, transportOptions, cb);
                } else {
                  cb(error, html);
                }
              }
            ),
          ...transportOptions,
        }),
        { excludeMain: true }
      )
    );
  };
}

const mjmlConfigDefault = {
  keepComments: false,
  beautify: false,
  minify: true,
  validationLevel: 'strict',
};

/**
 * Send emails via various transports, rendered with Express-compatible
 * renderers.
 *
 * Transports
 * ----
 *
 * See `keystone-email` for supported transports and options.
 *
 * Renderers
 * ----
 *
 * Express-compatible renderers should work out of the box (as long as they
 * export an `__express` key). See: https://github.com/keystonejs/keystone-email/issues/8
 *
 * There is also a `jsx` renderer powered by `express-react-views`.
 *
 * Usage:
 * const emailSender = require('@keystone-alpha/email');
 *
 * const jsxEmailSender = emailSender.jsx({
 *   // The directory containing the email templates
 *   root: `${__dirname}/emails`,
 *   // The transport to send the emails (see `keystone-email` docs)
 *   transport: 'mailgun'
 * });
 *
 * await jsxEmailSender('new-user.jsx').send(
 *   { ... }, // renderer props
 *   { ... }, // transport options (api keys, to/from, etc). See `keystone-email` docs
 * );
 */
module.exports = new Proxy(
  {
    jsx: jsxFactory(),
    mjml: jsxFactory({
      onRender(error, mjml, options, cb) {
        if (error) {
          return cb(error, mjml);
        }
        try {
          const mjmlOptions = {
            ...mjmlConfigDefault,
            ...(options.mjml || {}),
          };

          const { html, errors } = mjml2html(mjml, mjmlOptions);

          if (errors && errors.length) {
            const mjmlError = new Error('Errors while parsing mjml template');
            mjmlError.errors = errors;
            return cb(mjmlError);
          }

          cb(null, html);
        } catch (mjmlError) {
          cb(mjmlError);
        }
      },
    }),
  },
  {
    get(target, ext) {
      // The factory already exists, so return it
      if (!(ext in target)) {
        // NOTE: We don't allow overwriting of the `engine`
        target[ext] = ({ root, transport, engine, ...transportOptions }) => {
          if (!root || !fs.existsSync(root)) {
            throw new Error(`'root' must be a valid directory for email views. Got '${root}'.`);
          }

          return memoize(template =>
            pify(
              new Email(template, {
                root,
                transport,
                ext: `.${ext}`,
                ...transportOptions,
              }),
              { excludeMain: true }
            )
          );
        };
      }

      return target[ext];
    },
  }
);
